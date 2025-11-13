# Docker Troubleshooting Guide

## Error: "unable to get image 'mongo:7.0': error during connect"

This error means Docker Desktop is not running or Docker daemon is not accessible.

## Solution 1: Start Docker Desktop

1. **Open Docker Desktop** application on Windows
2. **Wait for it to fully start** (whale icon in system tray should be steady)
3. **Verify it's running**:
   ```bash
   docker ps
   ```
   Should return an empty list (not an error)

4. **Try again**:
   ```bash
   npm run docker:up
   ```

## Solution 2: Check Docker Desktop Status

### Windows:
- Look for Docker Desktop icon in system tray (bottom right)
- If not running, search for "Docker Desktop" in Start menu and launch it
- Wait until the icon shows "Docker Desktop is running"

### Verify Docker is Running:
```bash
docker info
```

If this works, Docker is running. If you get an error, Docker Desktop needs to be started.

## Solution 3: Alternative - Use Latest MongoDB Tag

If you continue having issues, try using the `latest` tag instead:

Update `docker-compose.yml`:
```yaml
image: mongo:latest
```

Then run:
```bash
npm run docker:up
```

## Solution 4: Manual Docker Pull

Try pulling the image manually first:
```bash
docker pull mongo:7.0
```

If this works, then try:
```bash
npm run docker:up
```

## Solution 5: Check Docker Desktop Settings

1. Open Docker Desktop
2. Go to Settings → General
3. Ensure "Use the WSL 2 based engine" is checked (if using WSL)
4. Click "Apply & Restart"

## Solution 6: Restart Docker Desktop

1. Right-click Docker Desktop icon in system tray
2. Select "Quit Docker Desktop"
3. Wait a few seconds
4. Start Docker Desktop again
5. Wait for it to fully start
6. Try `npm run docker:up` again

## Common Issues

### "Docker daemon is not running"
- **Fix**: Start Docker Desktop application

### "Cannot connect to Docker daemon"
- **Fix**: Ensure Docker Desktop is fully started (not just installed)

### "Network timeout" or "Connection refused"
- **Fix**: Check your internet connection
- **Fix**: Try pulling a different tag: `mongo:latest` or `mongo:6.0`

### Port 27017 already in use
- **Fix**: Stop any local MongoDB service
- **Fix**: Or change the port in `docker-compose.yml`:
  ```yaml
  ports:
    - "27018:27017"  # Use port 27018 on host
  ```
  Then update `.env.local`:
  ```bash
  MONGODB_URI=mongodb://localhost:27018/monydragon_portfolio
  ```

## Verify Setup

After Docker Desktop is running:

1. **Check Docker is accessible**:
   ```bash
   docker ps
   ```

2. **Start MongoDB**:
   ```bash
   npm run docker:up
   ```

3. **Verify MongoDB is running**:
   ```bash
   npm run docker:status
   ```

4. **Check logs** (if issues):
   ```bash
   npm run docker:logs
   ```

## Still Having Issues?

If Docker Desktop won't start:
1. Restart your computer
2. Check Windows updates
3. Ensure virtualization is enabled in BIOS
4. Reinstall Docker Desktop if needed

