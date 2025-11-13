# Port Troubleshooting Guide

## Error: "EACCES: permission denied 0.0.0.0:3001"

This error occurs when:
1. Port 3000 is already in use by another Node.js process
2. Next.js automatically tries port 3001 as fallback
3. Port 3001 has permission issues or is reserved by Windows

## Quick Fix

### Step 1: Kill the Process Using Port 3000

**Find and kill the Node.js process:**
```powershell
# Kill the specific process
taskkill /PID 24232 /F

# Or kill all Node.js processes
taskkill /F /IM node.exe
```

### Step 2: Start Your Server

```bash
npm run dev
```

## Alternative: Use a Different Port

If you want to keep the other process running, use port 3002:

1. **Update `package.json`:**
   ```json
   {
     "scripts": {
       "dev": "next dev -p 3002"
     }
   }
   ```

2. **Update `.env.local`:**
   ```bash
   PORT=3002
   NEXTAUTH_URL=http://localhost:3002
   ```

3. **Start server:**
   ```bash
   npm run dev
   ```

## Check What's Using a Port

```powershell
netstat -ano | findstr :3000
```

## Verify Port is Free

```powershell
netstat -ano | findstr :3000
```

If nothing is returned, the port is free.
