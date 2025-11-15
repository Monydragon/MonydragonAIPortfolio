# Complete Production Deployment Guide

## Step-by-Step Verification Process

Follow these steps in order to ensure your site is working correctly.

---

## STEP 1: Create Missing Files on Server

### 1.1 Create hooks Directory and useSound.ts

Run these commands on your server via SSH (MobaXterm):

```bash
cd /mony/administrator/monydragon-ai-portfolio

# Create hooks directory
mkdir -p hooks

# Create useSound.ts file
cat > hooks/useSound.ts << 'EOF'
"use client";

import { useEffect } from 'react';
import { soundManager, SoundType } from '@/lib/sounds';

export function useSound(type: SoundType, enabled: boolean = true) {
  useEffect(() => {
    if (enabled) {
      soundManager.loadPreferences();
    }
  }, [enabled]);

  const play = () => {
    if (enabled) {
      soundManager.play(type);
    }
  };

  return { play, soundManager };
}
EOF
```

### 1.2 Verify lib/sounds.ts Exists

```bash
# Check if sounds.ts exists
ls -la lib/sounds.ts

# If it doesn't exist, create it:
cat > lib/sounds.ts << 'EOF'
// Sound effects system for interactive feedback

export type SoundType = 'click' | 'hover' | 'navigation' | 'success' | 'error' | 'pageTransition';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private soundsEnabled: boolean = false;
  private volume: number = 0.3;
  private hasAttemptedInit = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadPreferences();
    }
  }

  private initAudioContext() {
    if (this.hasAttemptedInit) return;
    this.hasAttemptedInit = true;
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext not supported');
    }
  }

  private ensureAudioContext() {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Generate sound using Web Audio API
  private generateSound(frequency: number, duration: number, type: 'sine' | 'square' | 'sawtooth' = 'sine'): void {
    if (!this.soundsEnabled) return;

    this.ensureAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  play(type: SoundType): void {
    if (!this.soundsEnabled) return;

    switch (type) {
      case 'click':
        // Short, crisp click sound
        this.generateSound(800, 0.05, 'sine');
        break;
      case 'hover':
        // Subtle hover sound
        this.generateSound(600, 0.03, 'sine');
        break;
      case 'navigation':
        // Navigation sound (slightly longer)
        this.generateSound(400, 0.1, 'sine');
        break;
      case 'success':
        // Success sound (ascending)
        this.generateSound(600, 0.15, 'sine');
        setTimeout(() => this.generateSound(800, 0.15, 'sine'), 50);
        break;
      case 'error':
        // Error sound (descending)
        this.generateSound(400, 0.2, 'square');
        break;
      case 'pageTransition':
        // Page transition sound
        this.generateSound(500, 0.2, 'sine');
        break;
    }
  }

  setEnabled(enabled: boolean): void {
    this.soundsEnabled = enabled;
    if (enabled) {
      this.ensureAudioContext();
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundsEnabled', enabled.toString());
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  isEnabled(): boolean {
    return this.soundsEnabled;
  }

  loadPreferences(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('soundsEnabled');
      if (saved !== null) {
        this.soundsEnabled = saved === 'true';
        if (this.soundsEnabled) {
          this.initAudioContext();
        }
      }
    }
  }
}

// Singleton instance
export const soundManager = new SoundManager();
EOF
```

### 1.3 Verify Files Were Created

```bash
# Verify both files exist
ls -la hooks/useSound.ts
ls -la lib/sounds.ts

# Both should show file details
```

---

## STEP 2: Verify Environment Configuration

### 2.1 Check .env.local File

```bash
cd /mony/administrator/monydragon-ai-portfolio
cat .env.local
```

Should contain:
- `MONGODB_URI=mongodb://localhost:27017/monydragon_portfolio`
- `NEXTAUTH_URL=https://monydragon.com`
- `NEXTAUTH_SECRET=<your-secret>`
- `NEXTAUTH_TRUST_HOST=true`
- `NODE_ENV=production`
- `PORT=3000`
- `OLLAMA_BASE_URL=http://localhost:11434` (if using Ollama)
- `OLLAMA_MODEL=llama3.2` (if using Ollama)

### 2.2 Generate NEXTAUTH_SECRET (if missing)

```bash
openssl rand -base64 32
```

Copy the output and update `.env.local`:

```bash
nano .env.local
```

---

## STEP 3: Verify Services Are Running

### 3.1 Check MongoDB

```bash
docker compose ps
```

Should show `monydragon-mongodb` as `Up`. If not:

```bash
docker compose up -d mongodb
docker compose logs mongodb --tail 20
```

### 3.2 Check Ollama (if using)

```bash
docker compose ps | grep ollama
```

Should show `monydragon-ollama` as `Up`. If not:

```bash
docker compose up -d ollama
```

---

## STEP 4: Install Dependencies and Build

### 4.1 Install Dependencies

```bash
cd /mony/administrator/monydragon-ai-portfolio
npm install
```

Wait for completion (may take 2-5 minutes).

### 4.2 Clean Previous Build

```bash
rm -rf .next
```

### 4.3 Build Application

```bash
npm run build
```

**VERIFY:** Build should complete without errors. Look for:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

If you see errors, fix them before proceeding.

---

## STEP 5: Create Admin User

### 5.1 Create Admin User

```bash
cd /mony/administrator/monydragon-ai-portfolio

# Option 1: Use defaults
npm run create-admin

# Option 2: Set custom credentials
export ADMIN_EMAIL=admin@monydragon.com
export ADMIN_PASSWORD=your-secure-password
npm run create-admin
```

**VERIFY:** Should see "Admin user created successfully" or similar.

---

## STEP 6: Setup PM2

### 6.1 Create PM2 Ecosystem File

```bash
cd /mony/administrator/monydragon-ai-portfolio

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'monydragon-portfolio',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/mony/administrator/monydragon-ai-portfolio',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
EOF
```

### 6.2 Create Logs Directory

```bash
mkdir -p logs
```

### 6.3 Start Application with PM2

```bash
pm2 start ecosystem.config.js
```

### 6.4 Verify PM2 Status

```bash
pm2 status
```

**VERIFY:** Should show `monydragon-portfolio` as `online` (green).

### 6.5 Check Application Logs

```bash
pm2 logs monydragon-portfolio --lines 50
```

**VERIFY:** Should see no errors, application should be listening on port 3000.

### 6.6 Save PM2 Configuration

```bash
pm2 save
pm2 startup
```

Copy and run the command it outputs (will look like):
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u administrator --hp /home/administrator
```

---

## STEP 7: Test Local Application

### 7.1 Test on Localhost

```bash
curl http://localhost:3000
```

**VERIFY:** Should return HTML content (not an error).

### 7.2 Check Port 3000

```bash
sudo netstat -tulpn | grep 3000
```

**VERIFY:** Should show port 3000 is listening.

---

## STEP 8: Configure Nginx

### 8.1 Verify Nginx is Installed

```bash
nginx -v
```

If not installed:
```bash
sudo apt update
sudo apt install -y nginx
```

### 8.2 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/monydragon.com
```

Paste this configuration:

```nginx
# HTTP server - redirect to HTTPS and allow Let's Encrypt verification
server {
    listen 80;
    listen [::]:80;
    server_name monydragon.com www.monydragon.com;
    
    # Allow Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name monydragon.com www.monydragon.com;

    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/monydragon.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/monydragon.com/privkey.pem;
    # include /etc/letsencrypt/options-ssl-nginx.conf;
    # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### 8.3 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/monydragon.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null
```

### 8.4 Test Nginx Configuration

```bash
sudo nginx -t
```

**VERIFY:** Should say "syntax is ok" and "test is successful".

### 8.5 Reload Nginx

```bash
sudo systemctl reload nginx
sudo systemctl status nginx
```

**VERIFY:** Should show nginx as `active (running)`.

---

## STEP 9: Setup SSL Certificate

### 9.1 Verify DNS is Pointing to Your Server

```bash
nslookup monydragon.com
nslookup www.monydragon.com
```

**VERIFY:** Both should return `155.117.45.234` (not Cloudflare IPs).

If still showing Cloudflare IPs:
1. Go to Cloudflare DNS
2. Make sure `monydragon.com` and `www` A records are set to **DNS only** (gray cloud)
3. Wait 10-15 minutes

### 9.2 Install Certbot

```bash
# Try snap first (recommended)
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Or install via apt
sudo apt install -y certbot python3-certbot-nginx
```

### 9.3 Obtain SSL Certificate

```bash
sudo certbot --nginx -d monydragon.com -d www.monydragon.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose option 2 (Redirect HTTP to HTTPS)

**VERIFY:** Should say "Congratulations! Your certificate and chain have been saved"

### 9.4 Verify SSL Certificate

```bash
sudo certbot certificates
```

**VERIFY:** Should show certificate for `monydragon.com` and `www.monydragon.com`.

---

## STEP 10: Final Verification

### 10.1 Test HTTPS Access

```bash
curl -I https://monydragon.com
```

**VERIFY:** Should return `200 OK` or `301/302` redirect.

### 10.2 Test in Browser

Open in your browser:
- `https://monydragon.com` - Should load home page
- `https://monydragon.com/MonyAdmin/login` - Should load admin login

### 10.3 Check All Services

```bash
# Run verification script (if you uploaded it)
chmod +x verify-deployment.sh
./verify-deployment.sh

# Or check manually:
docker compose ps
pm2 status
sudo systemctl status nginx
```

### 10.4 Check Logs

```bash
# Application logs
pm2 logs monydragon-portfolio --lines 20

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

**VERIFY:** No errors in logs.

---

## Quick Verification Checklist

Run these commands to verify everything:

```bash
# 1. Files exist
ls -la hooks/useSound.ts lib/sounds.ts .env.local ecosystem.config.js

# 2. Services running
docker compose ps
pm2 status

# 3. Ports listening
sudo netstat -tulpn | grep -E ":(3000|443)"

# 4. Local test
curl http://localhost:3000 | head -20

# 5. HTTPS test
curl -I https://monydragon.com

# 6. DNS check
nslookup monydragon.com
```

---

## Troubleshooting

### Build Fails
- Check for missing files: `ls -la hooks/useSound.ts lib/sounds.ts`
- Check Node.js version: `node --version` (should be 18+)
- Clear cache: `rm -rf .next node_modules && npm install`

### Application Won't Start
- Check logs: `pm2 logs monydragon-portfolio`
- Check MongoDB: `docker compose logs mongodb`
- Check environment: `cat .env.local`

### Nginx 502 Bad Gateway
- Check app is running: `pm2 status`
- Check port 3000: `curl http://localhost:3000`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

### SSL Certificate Fails
- Verify DNS: `nslookup monydragon.com`
- Check port 80 is open: `sudo ufw allow 80/tcp`
- Check Nginx is running: `sudo systemctl status nginx`

---

## Success Indicators

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ PM2 shows application as `online`
- ✅ `curl http://localhost:3000` returns HTML
- ✅ `curl -I https://monydragon.com` returns 200 OK
- ✅ Site loads in browser at `https://monydragon.com`
- ✅ Admin login page loads at `https://monydragon.com/MonyAdmin/login`
- ✅ No errors in PM2 or Nginx logs

Follow these steps in order and verify each step before moving to the next!

