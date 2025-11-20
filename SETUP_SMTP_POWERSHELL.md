# SMTP Setup Commands (PowerShell/Windows)

## 1. Start MongoDB (if not running)

```powershell
docker compose up -d
```

## 2. Create Docker Network (if needed)

```powershell
# Check if network exists
$networkName = "monydragon-portfolio_monydragon-network"
$networkExists = docker network ls --filter name=$networkName --format "{{.Name}}"

if (-not $networkExists) {
    docker network create $networkName
    Write-Host "Network created: $networkName" -ForegroundColor Green
} else {
    Write-Host "Network already exists: $networkName" -ForegroundColor Yellow
}
```

Or simply (Docker Compose will create it automatically):

```powershell
# Just start the services - Docker Compose handles network creation
docker compose up -d
```

## 3. Start Poste.io SMTP Server

```powershell
docker compose -f docker-compose.smtp.yml up -d
```

## 4. Check Status

```powershell
# Check if containers are running
docker compose -f docker-compose.smtp.yml ps

# View logs
docker compose -f docker-compose.smtp.yml logs -f poste
```

## 5. Stop Services

```powershell
# Stop SMTP server
docker compose -f docker-compose.smtp.yml down

# Stop MongoDB
docker compose down
```

## 6. Restart Services

```powershell
# Restart SMTP server
docker compose -f docker-compose.smtp.yml restart

# Restart MongoDB
docker compose restart
```

## 7. View All Logs

```powershell
# SMTP logs
docker compose -f docker-compose.smtp.yml logs --tail=100 poste

# MongoDB logs
docker compose logs --tail=100 mongodb
```

## 8. Remove Everything (Cleanup)

```powershell
# Stop and remove SMTP containers (keeps data volumes)
docker compose -f docker-compose.smtp.yml down

# Stop and remove MongoDB containers (keeps data volumes)
docker compose down

# Remove volumes too (WARNING: Deletes all data!)
docker compose -f docker-compose.smtp.yml down -v
docker compose down -v
```

## Quick One-Liner to Start Everything

```powershell
docker compose up -d; docker compose -f docker-compose.smtp.yml up -d
```

## Troubleshooting

### Check if ports are in use

```powershell
# Check port 587 (SMTP)
netstat -ano | findstr :587

# Check port 80 (HTTP)
netstat -ano | findstr :80

# Check port 443 (HTTPS)
netstat -ano | findstr :443
```

### Check Docker network

```powershell
docker network ls
docker network inspect monydragon-portfolio_monydragon-network
```

### Access Poste.io Web UI

After starting, access at:
- `http://localhost` (if running locally)
- `http://your-server-ip` (if on server)
- `https://mail.monydragon.com` (if DNS configured)

Default credentials:
- Email: `admin@monydragon.com`
- Password: `changeme`

**Change password immediately after first login!**

