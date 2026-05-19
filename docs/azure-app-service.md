# Azure App Service Hosting

This guide prepares Stagecraft for the cheapest full-app Azure deployment: one Linux Azure App Service app on the Free F1 tier. It does not use Azure Static Web Apps because Stagecraft needs the Express API routes, server-side sessions, and `/ws` WebSocket endpoint.

## Build the Deployment Package

From the repository root:

```powershell
npm run package:azure
```

The script:

- Runs `npm ci`.
- Runs `npm run build`.
- Creates a clean staging directory under `.azure-publish/appservice`.
- Installs production dependencies into that staging directory.
- Copies `client/dist` and `server/dist`.
- Writes `.azure-publish/stagecraft-appservice.zip`.

The script only creates a local ZIP. It does not call `az` or deploy anything.

## Automatic Deploys from GitHub

The GitHub Actions workflow deploys to Azure automatically after a successful push to `main`. The deploy job waits for the quality gates, Playwright E2E tests, and production Docker image build to pass before publishing the Azure ZIP package.

Create these repository secrets in GitHub before relying on automatic deploys. They must be repository secrets, not only environment secrets, because the deploy job reads them directly from `secrets.*`.

| Secret                         | Value                                                               |
| ------------------------------ | ------------------------------------------------------------------- |
| `AZURE_WEBAPP_NAME`            | The Azure App Service app name, without `.azurewebsites.net`.       |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | The full publish profile XML downloaded from the Azure App Service. |

In the Azure portal, open the App Service and use **Get publish profile**. Copy the downloaded file contents into the `AZURE_WEBAPP_PUBLISH_PROFILE` repository secret.

After those secrets exist, every push to `main` will build `.azure-publish/stagecraft-appservice.zip` and deploy it through the App Service Kudu Zip Deploy API.

The publish profile flow also requires SCM basic publishing credentials to be enabled on the App Service. Keep FTP publishing disabled unless you explicitly need it:

```powershell
az resource update `
  --resource-group $resourceGroup `
  --namespace Microsoft.Web `
  --resource-type basicPublishingCredentialsPolicies `
  --parent "sites/$app" `
  --name scm `
  --set properties.allow=true

az resource update `
  --resource-group $resourceGroup `
  --namespace Microsoft.Web `
  --resource-type basicPublishingCredentialsPolicies `
  --parent "sites/$app" `
  --name ftp `
  --set properties.allow=false
```

## Create Azure Resources Later

Choose names first:

```powershell
$resourceGroup = "rg-stagecraft-free"
$location = "centralus"
$plan = "asp-stagecraft-free"
$app = "<globally-unique-app-name>"
$zip = ".azure-publish/stagecraft-appservice.zip"
```

Create the Free F1 Linux App Service resources:

```powershell
az group create `
  --name $resourceGroup `
  --location $location

az appservice plan create `
  --name $plan `
  --resource-group $resourceGroup `
  --location $location `
  --sku F1 `
  --is-linux

az webapp create `
  --name $app `
  --resource-group $resourceGroup `
  --plan $plan `
  --runtime "NODE:22-lts" `
  --startup-file "node server/dist/index.js"
```

Generate a real session secret locally and store it only in Azure:

```powershell
$sessionSecret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))

az webapp config appsettings set `
  --resource-group $resourceGroup `
  --name $app `
  --settings `
    NODE_ENV=production `
    SESSION_SECRET=$sessionSecret `
    CLIENT_ORIGIN="https://$app.azurewebsites.net"
```

Enable WebSockets:

```powershell
az webapp config set `
  --resource-group $resourceGroup `
  --name $app `
  --web-sockets-enabled true
```

Deploy the ZIP:

```powershell
az webapp deployment source config-zip `
  --resource-group $resourceGroup `
  --name $app `
  --src $zip
```

Stream logs during first startup:

```powershell
az webapp log tail `
  --resource-group $resourceGroup `
  --name $app
```

## Verify After Deployment

Open these URLs:

- `https://<app-name>.azurewebsites.net/`
- `https://<app-name>.azurewebsites.net/health`
- `https://<app-name>.azurewebsites.net/practice/network-api`
- `https://<app-name>.azurewebsites.net/practice/websocket-interception`

Check these behaviors:

- SPA routes refresh without a 404.
- `/api/tasks` returns JSON.
- The fake-auth lab can log in and keep a session cookie.
- The WebSocket lab connects to `wss://<app-name>.azurewebsites.net/ws`.

## Cost Notes

Free F1 is the lowest-cost option for the full app, but it is a dev/test tier with tight quotas and no production SLA. If those limits get in the way, keep the same app and upgrade the App Service plan to Linux B1.
