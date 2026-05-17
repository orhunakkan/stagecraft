param(
  [string]$OutputPath = ".azure-publish/stagecraft-appservice.zip",
  [switch]$SkipRestore,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$publishRoot = Join-Path $repoRoot ".azure-publish"
$buildDir = Join-Path $publishRoot "build"
$stagingDir = Join-Path $publishRoot "appservice"

function Resolve-UnderRepo {
  param([string]$Path)

  if ([System.IO.Path]::IsPathRooted($Path)) {
    return [System.IO.Path]::GetFullPath($Path)
  }

  return [System.IO.Path]::GetFullPath((Join-Path $repoRoot $Path))
}

function Assert-ChildPath {
  param(
    [string]$Path,
    [string]$Parent
  )

  $resolvedPath = [System.IO.Path]::GetFullPath($Path).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
  $resolvedParent = [System.IO.Path]::GetFullPath($Parent).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
  $comparison = [System.StringComparison]::OrdinalIgnoreCase

  if (-not $resolvedPath.StartsWith($resolvedParent + [System.IO.Path]::DirectorySeparatorChar, $comparison)) {
    throw "Refusing to modify path outside $resolvedParent`: $resolvedPath"
  }
}

$zipPath = Resolve-UnderRepo $OutputPath
$zipParent = Split-Path -Parent $zipPath

Assert-ChildPath -Path $stagingDir -Parent $repoRoot
Assert-ChildPath -Path $buildDir -Parent $repoRoot
Assert-ChildPath -Path $zipPath -Parent $repoRoot

function Invoke-Checked {
  param(
    [string]$Command,
    [string[]]$Arguments,
    [string]$WorkingDirectory
  )

  Push-Location $WorkingDirectory
  try {
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "$Command $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
    }
  }
  finally {
    Pop-Location
  }
}

function Copy-SourceDirectory {
  param(
    [string]$Source,
    [string]$Destination
  )

  robocopy $Source $Destination /E /NFL /NDL /NJH /NJS /NP /XD node_modules dist coverage /XF *.tsbuildinfo | Out-Host
  $exitCode = $LASTEXITCODE
  $global:LASTEXITCODE = 0

  if ($exitCode -gt 7) {
    throw "robocopy failed while copying $Source with exit code $exitCode"
  }
}

Write-Host "Preparing clean build and App Service staging directories..."
if (Test-Path -LiteralPath $buildDir) {
  Remove-Item -LiteralPath $buildDir -Recurse -Force
}

if (Test-Path -LiteralPath $stagingDir) {
  Remove-Item -LiteralPath $stagingDir -Recurse -Force
}

New-Item -ItemType Directory -Path $buildDir | Out-Null
New-Item -ItemType Directory -Path $stagingDir | Out-Null

Copy-Item -LiteralPath (Join-Path $repoRoot "package.json") -Destination $buildDir
Copy-Item -LiteralPath (Join-Path $repoRoot "package-lock.json") -Destination $buildDir
Copy-Item -LiteralPath (Join-Path $repoRoot "tsconfig.base.json") -Destination $buildDir
Copy-Item -LiteralPath (Join-Path $repoRoot "tsconfig.json") -Destination $buildDir
Copy-SourceDirectory -Source (Join-Path $repoRoot "client") -Destination (Join-Path $buildDir "client")
Copy-SourceDirectory -Source (Join-Path $repoRoot "server") -Destination (Join-Path $buildDir "server")

if (-not $SkipRestore) {
  Write-Host "Installing workspace dependencies in clean build directory..."
  Invoke-Checked -Command "npm" -Arguments @("ci") -WorkingDirectory $buildDir
}

if (-not $SkipBuild) {
  Write-Host "Building client and server in clean build directory..."
  Invoke-Checked -Command "npm" -Arguments @("run", "build") -WorkingDirectory $buildDir
}
else {
  if (-not (Test-Path -LiteralPath (Join-Path $repoRoot "client/dist")) -or -not (Test-Path -LiteralPath (Join-Path $repoRoot "server/dist"))) {
    throw "SkipBuild requires existing client/dist and server/dist directories."
  }

  Copy-Item -LiteralPath (Join-Path $repoRoot "client/dist") -Destination (Join-Path $buildDir "client/dist") -Recurse
  Copy-Item -LiteralPath (Join-Path $repoRoot "server/dist") -Destination (Join-Path $buildDir "server/dist") -Recurse
}

New-Item -ItemType Directory -Path (Join-Path $stagingDir "client") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stagingDir "server") | Out-Null

Copy-Item -LiteralPath (Join-Path $buildDir "package.json") -Destination $stagingDir
Copy-Item -LiteralPath (Join-Path $buildDir "package-lock.json") -Destination $stagingDir
Copy-Item -LiteralPath (Join-Path $buildDir "client/package.json") -Destination (Join-Path $stagingDir "client/package.json")
Copy-Item -LiteralPath (Join-Path $buildDir "server/package.json") -Destination (Join-Path $stagingDir "server/package.json")

Write-Host "Installing production dependencies into staging directory..."
Invoke-Checked -Command "npm" -Arguments @("ci", "--omit=dev", "--workspaces", "--include-workspace-root") -WorkingDirectory $stagingDir

Copy-Item -LiteralPath (Join-Path $buildDir "client/dist") -Destination (Join-Path $stagingDir "client/dist") -Recurse
Copy-Item -LiteralPath (Join-Path $buildDir "server/dist") -Destination (Join-Path $stagingDir "server/dist") -Recurse

if (-not (Test-Path -LiteralPath $zipParent)) {
  New-Item -ItemType Directory -Path $zipParent | Out-Null
}

if (Test-Path -LiteralPath $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

Write-Host "Creating deployment ZIP..."
Compress-Archive -Path (Join-Path $stagingDir "*") -DestinationPath $zipPath -Force

Write-Host ""
Write-Host "Created App Service package:"
Write-Host "  $zipPath"
Write-Host ""
Write-Host "This script does not deploy anything. When ready, deploy the ZIP with:"
Write-Host "  az webapp deployment source config-zip --resource-group <resource-group> --name <app-name> --src `"$zipPath`""
