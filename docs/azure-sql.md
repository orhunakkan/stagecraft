# Azure SQL Database (Audit Log & Search lab)

The `audit-log-search` lab is the only part of Stagecraft that talks to a real, persistent datastore — every other lab uses in-memory fixtures on purpose (see `SPEC.md`'s Resolved Decisions table, #5). This guide provisions the free-tier Azure SQL Database that lab's `SqlAuditLogStore` uses.

Setting this up is **optional**. Without `AZURE_SQL_CONNECTION_STRING` configured, the lab automatically falls back to an in-memory store with identical seed data and query behavior — the rest of the app, and CI, never require Azure SQL at all.

## Create Azure Resources

Choose names first:

```powershell
$resourceGroup = "rg-stagecraft-free"
$location = "centralus"
$sqlServer = "<globally-unique-sql-server-name>"
$sqlDatabase = "stagecraft-audit-log"
$sqlAdminUser = "stagecraft_admin"
```

Generate a strong admin password locally and never commit it:

```powershell
$sqlAdminPassword = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(24))
```

Create the logical SQL server and the free-tier database:

```powershell
az group create `
  --name $resourceGroup `
  --location $location

az sql server create `
  --name $sqlServer `
  --resource-group $resourceGroup `
  --location $location `
  --admin-user $sqlAdminUser `
  --admin-password $sqlAdminPassword

az sql db create `
  --name $sqlDatabase `
  --resource-group $resourceGroup `
  --server $sqlServer `
  --edition GeneralPurpose `
  --family Gen5 `
  --capacity 2 `
  --compute-model Serverless `
  --use-free-limit `
  --free-limit-exhaustion-behavior AutoPause
```

`--use-free-limit` is allowed on exactly one database per subscription — this was confirmed against `az sql db create --help` before building this lab. `AutoPause` means the database simply stops accepting new compute once the monthly free limit is used, rather than silently billing overage; pick `BillOverUsage` instead if you'd rather the database stay always-on.

## Configure the Firewall

The database has no public access by default. Allow Azure services (App Service) to reach it:

```powershell
az sql server firewall-rule create `
  --resource-group $resourceGroup `
  --server $sqlServer `
  --name AllowAzureServices `
  --start-ip-address 0.0.0.0 `
  --end-ip-address 0.0.0.0
```

For local development, also allow your current machine's IP:

```powershell
$myIp = (Invoke-RestMethod -Uri "https://api.ipify.org")

az sql server firewall-rule create `
  --resource-group $resourceGroup `
  --server $sqlServer `
  --name AllowLocalDev `
  --start-ip-address $myIp `
  --end-ip-address $myIp
```

Re-run this rule if your local IP changes.

## Build the Connection String

```powershell
$connectionString = "Server=tcp:$sqlServer.database.windows.net,1433;Initial Catalog=$sqlDatabase;Persist Security Info=False;User ID=$sqlAdminUser;Password=$sqlAdminPassword;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
```

`Encrypt=True` is mandatory for Azure SQL — connections without TLS are rejected.

## Local Development

Add the connection string to your local `.env` (never commit this file):

```
AZURE_SQL_CONNECTION_STRING=<paste the connection string here>
```

Start the server as usual (`npm run dev:server` or `npm run dev`). On boot, `initAuditLogStore()` connects and creates the `AuditLog` table and its indexes if they don't already exist — this is idempotent, so it's safe across restarts. Watch the server log for `Azure SQL audit log schema is ready`.

## Deployed Configuration

Set the same connection string as an App Service application setting, exactly like `SESSION_SECRET` in `docs/azure-app-service.md`:

```powershell
az webapp config appsettings set `
  --resource-group $resourceGroup `
  --name $app `
  --settings AZURE_SQL_CONNECTION_STRING="$connectionString"
```

This is a manual, one-time `az` step — there is no GitHub Actions secret for it, matching how `SESSION_SECRET` itself is provisioned today.

## Verify After Deployment

- Sign in to `/practice/fake-auth` as `alice`, then visit `/practice/audit-log-search` — a fresh `login` row should appear immediately.
- `az webapp restart --resource-group $resourceGroup --name $app`, then reload the audit log page — the rows should still be there. This is the property the rest of Stagecraft's in-memory fixtures can't demonstrate.

## Cost Notes

The free tier covers 100,000 vCore-seconds of compute and 32 GB of storage per month, and only one database per subscription may use it. Because the database is serverless, it auto-pauses when idle — the first request after a pause can take longer to resume, which is why `lib/db.ts` raises connection/request timeouts and retries the initial connection with backoff rather than failing immediately.
