# Quick Start: SMTP Server Setup

## 1. Start Poste.io SMTP Server

```bash
# Make sure MongoDB is running first
docker compose up -d

# Start the SMTP server
docker compose -f docker-compose.smtp.yml up -d

# Check status
docker compose -f docker-compose.smtp.yml ps
```

## 2. Access Web UI

Open: `http://your-server-ip` or `https://mail.monydragon.com`

- Default login: `admin@monydragon.com` / `changeme`
- **Change password immediately!**

## 3. Configure Domain & Mailboxes

1. **Add Domain:**
   - Go to **Virtual Domains** → **Add Domain**
   - Enter: `monydragon.com`

2. **Create Mailboxes:**
   - Go to **Virtual Users** → **Add Mailbox**
   - Create: `noreply@monydragon.com` (set a strong password)
   - Create: `support@monydragon.com` (set a strong password)

## 4. Update .env.local

```bash
SMTP_HOST=mail.monydragon.com
SMTP_PORT=587
SMTP_USER=noreply@monydragon.com
SMTP_PASS=your-mailbox-password-here
SMTP_SECURE=false
MAIL_FROM="Monydragon <noreply@monydragon.com>"
```

## 5. Configure DNS (Important!)

Add these DNS records:

```
# A Record
mail.monydragon.com  →  YOUR_SERVER_IP

# MX Record
monydragon.com  →  mail.monydragon.com  (Priority: 10)

# SPF (TXT Record)
v=spf1 mx ~all

# DKIM (Get from Poste.io UI → Virtual Domains → DKIM Keys)
dkim._domainkey.monydragon.com  →  (paste public key)

# DMARC (TXT Record)
_dmarc.monydragon.com  →  v=DMARC1; p=quarantine; rua=mailto:dmarc@monydragon.com
```

## 6. Enable SSL/TLS

1. In Poste.io UI: **System Settings** → **TLS Certificate**
2. Enable **Let's Encrypt**
3. Domain: `mail.monydragon.com`
4. Email: `admin@monydragon.com`
5. Click **Save**

## 7. Test Email

Your app will now send emails automatically when:
- Users register (verification email)
- Users request password reset
- Any other email functionality

## Troubleshooting

**Can't access web UI?**
```bash
docker compose -f docker-compose.smtp.yml logs -f poste
```

**Port 25 blocked?**
- Use port 587 (already configured)
- Request port 25 unblock from hosting provider

**Emails going to spam?**
- Check SPF/DKIM/DMARC at [mail-tester.com](https://www.mail-tester.com)
- Set up reverse DNS (PTR record) with hosting provider

For detailed setup, see `SMTP_SETUP.md`

