# Docker Installation Troubleshooting for Ubuntu 24

This guide helps you resolve common Docker installation issues on Ubuntu 24.

## Quick Fix: Use Official Docker Script (Easiest Method)

If you're having issues, try this first:

```bash
# Download and run the official Docker installation script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Apply group changes
newgrp docker

# Test
docker run hello-world
```

## Common Errors and Solutions

### Error 1: "E: Unable to locate package docker-ce"

**Solution:**
```bash
# Update package lists
sudo apt update

# Try the official script instead
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Error 2: "GPG error: The following signatures couldn't be verified"

**Solution:**
```bash
# Remove old GPG keys and repository
sudo rm -f /etc/apt/keyrings/docker.gpg
sudo rm -f /etc/apt/sources.list.d/docker.list

# Use the official script (recommended)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# OR manually fix GPG
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

### Error 3: "Permission denied while trying to connect to the Docker daemon socket"

**Solution:**
```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Apply changes (choose one):
# Option A: Log out and log back in
# Option B: Use newgrp
newgrp docker

# Option C: Use sudo temporarily
sudo docker --version

# Verify you're in the group
groups
# Should show "docker" in the list
```

### Error 4: "docker: command not found"

**Solution:**
```bash
# Check if Docker is installed
which docker

# If not found, install using official script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify installation
docker --version
```

### Error 5: "docker compose: command not found" or "docker-compose: command not found"

**Solution:**
```bash
# Check which version is installed
docker compose version  # New syntax (no hyphen)
docker-compose --version  # Old syntax (with hyphen)

# If neither works, install docker-compose plugin
sudo apt update
sudo apt install -y docker-compose-plugin

# Or install standalone docker-compose
sudo apt install -y docker-compose

# Verify
docker compose version
```

### Error 6: "Cannot connect to the Docker daemon. Is the docker daemon running?"

**Solution:**
```bash
# Check Docker service status
sudo systemctl status docker

# Start Docker service
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker

# Check for errors
sudo journalctl -u docker.service -n 50

# Restart Docker
sudo systemctl restart docker
```

### Error 7: "Repository '...' does not have a Release file"

**Solution:**
```bash
# This usually means Ubuntu 24 codename isn't recognized
# Use the official script instead
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# OR manually set the codename
. /etc/os-release
echo $VERSION_CODENAME  # Should show "noble" for Ubuntu 24.04

# Update repository with correct codename
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  noble stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Error 8: "Failed to start docker.service: Unit docker.service not found"

**Solution:**
```bash
# Docker isn't installed properly
# Remove everything and reinstall
sudo apt remove -y docker docker-engine docker.io containerd runc docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Clean up
sudo rm -rf /var/lib/docker
sudo rm -rf /etc/docker
sudo rm -f /etc/apt/sources.list.d/docker.list
sudo rm -f /etc/apt/keyrings/docker.gpg

# Reinstall using official script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

## Alternative: Install Docker from Ubuntu Repositories

If the official Docker repository doesn't work, you can install from Ubuntu's repositories:

```bash
# Install Docker from Ubuntu repos (may be older version)
sudo apt update
sudo apt install -y docker.io docker-compose

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker-compose --version
```

**Note:** This installs an older version of Docker, but it should work for basic use.

## Verify Docker Installation

After installation, verify everything works:

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker compose version

# Check Docker service status
sudo systemctl status docker

# Test Docker (should work without sudo after newgrp)
docker run hello-world

# Check if you can run docker without sudo
docker ps
```

## Complete Clean Install (Last Resort)

If nothing else works, do a complete clean install:

```bash
# 1. Remove all Docker packages
sudo apt remove -y docker docker-engine docker.io containerd runc docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-compose

# 2. Remove Docker data and config
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
sudo rm -rf /etc/docker
sudo rm -rf /etc/containerd

# 3. Remove Docker repositories
sudo rm -f /etc/apt/sources.list.d/docker.list
sudo rm -f /etc/apt/keyrings/docker.gpg

# 4. Clean apt cache
sudo apt autoremove -y
sudo apt autoclean

# 5. Update package lists
sudo apt update

# 6. Install using official script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 7. Add user to docker group
sudo usermod -aG docker $USER

# 8. Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# 9. Apply group changes
newgrp docker

# 10. Test
docker run hello-world
```

## Still Having Issues?

If you're still having problems, please provide:

1. **The exact error message** you're seeing
2. **The command** you ran that caused the error
3. **Your Ubuntu version**: `lsb_release -a`
4. **Output of**: `sudo systemctl status docker`
5. **Output of**: `docker --version` (if it works with sudo)

## Quick Reference Commands

```bash
# Install Docker (easiest method)
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER && newgrp docker

# Start Docker
sudo systemctl start docker && sudo systemctl enable docker

# Test Docker
docker run hello-world

# Check Docker status
sudo systemctl status docker

# View Docker logs
sudo journalctl -u docker.service -n 50
```

