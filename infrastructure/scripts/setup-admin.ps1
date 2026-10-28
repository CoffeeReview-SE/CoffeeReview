$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$toolProject = Join-Path $projectRoot 'infrastructure\tools\AnalyticsDatabase\AnalyticsDatabase.csproj'
$gatewayProject = Join-Path $projectRoot 'services\gateway\src\SGCoffee.Gateway\SGCoffee.Gateway.csproj'

# Configure local admin credentials through a hidden password prompt and User Secrets.
$adminUsername = Read-Host 'Admin username'
if ([string]::IsNullOrWhiteSpace($adminUsername)) { throw 'Username is required' }
dotnet build $toolProject --nologo --verbosity quiet
if ($LASTEXITCODE -ne 0) { throw 'Cannot build credential tool' }
$adminHash = dotnet run --project $toolProject --no-build -- --hash-admin-password
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($adminHash)) { throw 'Cannot hash password' }
dotnet user-secrets set 'Admin:Username' $adminUsername --project $gatewayProject
if ($LASTEXITCODE -ne 0) { throw 'Cannot save username' }
dotnet user-secrets set 'Admin:PasswordHash' $adminHash.Trim() --project $gatewayProject
if ($LASTEXITCODE -ne 0) { throw 'Cannot save password hash' }
dotnet user-secrets set 'Admin:Enabled' 'true' --project $gatewayProject
if ($LASTEXITCODE -ne 0) { throw 'Cannot enable local admin' }
Write-Host 'Local admin configured. Restart Gateway in Development mode.'
