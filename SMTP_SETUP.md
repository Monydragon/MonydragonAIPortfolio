# SMTP Server Setup with Poste.io (Docker)

This guide will help you set up a free, self-hosted SMTP server using Poste.io in Docker.

## Prerequisites

- Ubuntu 24 Server
- Docker and Docker Compose installed
- Domain name (monydragon.com) with DNS access
- Ports 25, 80, 443, 587, 993, 995 open in firewall

## Quick Start

### 1. Start the SMTP Server

```bash
# Navigate to your project directory
cd /path/to/MonydragonAIPortfolio

# Start Poste.io SMTP server
docker compose -f docker-compose.smtp.yml up -d

# Check if it's running
docker compose -f docker-compose.smtp.yml ps

# View logs
docker compose -f docker-compose.smtp.yml logs -f poste
```

### 2. Access the Web UI

1. Open your browser and go to: `http://your-server-ip` or `https://mail.monydragon.com`
2. First-time setup:
   - Default admin email: `admin@monydragon.com`
   - Default password: `changeme`
   - **CHANGE THIS IMMEDIATELY!**

### 3. Configure Your Domain

1. In Poste.io UI, go to **Virtual Domains**
2. Click **Add Domain**
3. Enter: `monydragon.com`
4. Click **Save**

### 4. Create Mailboxes

1. Go to **Virtual Users**
2. Click **Add Mailbox**
3. Create these mailboxes:
   - `noreply@monydragon.com` (for automated emails)
   - `support@monydragon.com` (for support emails)
   - `admin@monydragon.com` (if not already created)
4. Set strong passwords for each

### 5. Configure DNS Records

Add these DNS records for your domain:

#### A Record
```
mail.monydragon.com  →  YOUR_SERVER_IP
```

#### MX Record
```
monydragon.com  →  mail.monydragon.com  (Priority: 10)
```

#### SPF Record (TXT)
```
v=spf1 mx ~all
```

#### DKIM Record
1. In Poste.io UI, go to **Virtual Domains** → Select your domain
2. Click **DKIM Keys**
3. Copy the public key
4. Add as TXT record:
```
dkim._domainkey.monydragon.com  →  (paste the public key)
```

#### DMARC Record (TXT)
```
_dmarc.monydragon.com  →  v=DMARC1; p=quarantine; rua=mailto:dmarc@monydragon.com
```

### 6. Configure Let's Encrypt (SSL/TLS)

1. In Poste.io UI, go to **System Settings** → **TLS Certificate**
2. Enable **Let's Encrypt**
3. Enter email: `admin@monydragon.com`
4. Enter domain: `mail.monydragon.com`
5. Click **Save** and wait for certificate generation

### 7. Update Your .env.local

Add these environment variables:

```bash
# SMTP Configuration (Poste.io)
SMTP_HOST=mail.monydragon.com
SMTP_PORT=587
SMTP_USER=noreply@monydragon.com
SMTP_PASS=YOUR_MAILBOX_PASSWORD_HERE
SMTP_SECURE=false
MAIL_FROM="Monydragon <noreply@monydragon.com>"

# Optional: For self-signed certs during testing
SMTP_REJECT_UNAUTHORIZED=false
```

**Note:** 
- Port `587` uses STARTTLS (SMTP_SECURE=false)
- Port `465` uses SSL/TLS (SMTP_SECURE=true)
- Use port `587` for better compatibility

### 8. Test Email Sending

```bash
# Test from your Next.js app
# The mailer will automatically use the SMTP settings from .env.local
```

Or test manually with curl:

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "subject": "Test", "html": "<p>Test email</p>"}'
```

## Troubleshooting

### Port 25 Blocked

Many cloud providers block port 25. If you can't send emails:

1. **Use port 587 (Submission)** - Already configured in docker-compose.smtp.yml
2. **Request port 25 unblock** from your hosting provider
3. **Use a relay service** (see alternatives below)

### Emails Going to Spam

1. **Check SPF/DKIM/DMARC** - Use [mail-tester.com](https://www.mail-tester.com)
2. **Set up reverse DNS (PTR)** - Contact your hosting provider
3. **Warm up your IP** - Start with low volume
4. **Use a dedicated IP** - Better reputation

### Can't Access Web UI

1. Check if container is running: `docker compose -f docker-compose.smtp.yml ps`
2. Check logs: `docker compose -f docker-compose.smtp.yml logs poste`
3. Verify ports are open: `sudo ufw status`
4. Check firewall: `sudo ufw allow 80,443/tcp`

### Let's Encrypt Not Working

1. Ensure DNS A record points to your server
2. Port 80 must be accessible from internet
3. Wait a few minutes for DNS propagation
4. Check logs: `docker compose -f docker-compose.smtp.yml logs poste`

## Alternative: Free SMTP Services (If Self-Hosting Fails)

If you can't get self-hosted email working, here are free alternatives:

### Brevo (formerly Sendinblue)
- **Free tier:** 300 emails/day
- **Setup:** Sign up, verify domain, get SMTP credentials
- **SMTP settings:**
  ```
  SMTP_HOST=smtp-relay.brevo.com
  SMTP_PORT=587
  SMTP_USER=your-email@brevo.com
  SMTP_PASS=your-api-key
  SMTP_SECURE=false
  ```

### Resend
- **Free tier:** 3,000 emails/month
- **Setup:** Sign up, verify domain, get API key
- **Note:** Uses API, not SMTP (would need to update mailer.ts)

### Amazon SES
- **Free tier:** 62,000 emails/month (if on EC2)
- **Setup:** Verify domain, request production access
- **SMTP settings:** Provided after setup

## Maintenance

### Backup Poste.io Data

```bash
# Backup volume
docker run --rm -v monydragon-portfolio_poste_data:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/poste-backup-$(date +%Y%m%d).tar.gz /data
```

### Update Poste.io

```bash
docker compose -f docker-compose.smtp.yml pull
docker compose -f docker-compose.smtp.yml up -d
```

### View Logs

```bash
docker compose -f docker-compose.smtp.yml logs -f poste
```

## Security Best Practices

1. **Change default admin password immediately**
2. **Use strong passwords for mailboxes**
3. **Enable 2FA in Poste.io UI** (if available)
4. **Keep Docker and Poste.io updated**
5. **Monitor logs for suspicious activity**
6. **Use fail2ban** to prevent brute force attacks
7. **Regular backups** of Poste.io data

## Support

- Poste.io Documentation: https://poste.io/doc
- Poste.io GitHub: https://github.com/analogic/poste.io

