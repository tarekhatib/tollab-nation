#!/usr/bin/env bash
# One-command deploy of the listener to a fresh Ubuntu server (Oracle / Google Cloud free tier).
#   ./whatsapp-listener/deploy.sh <server-ip> [path-to-ssh-key]
# Copies this folder (with .env), installs Node + pm2, starts the listener, keeps it
# running across reboots, then shows the logs so you can read the pairing code.
set -euo pipefail
IP="${1:?Usage: deploy.sh <server-ip> [ssh-key]}"
KEY="${2:-}"
SSH=(ssh -o StrictHostKeyChecking=accept-new ${KEY:+-i "$KEY"} "ubuntu@$IP")
DIR="$(cd "$(dirname "$0")" && pwd)"

rsync -az --exclude node_modules --exclude auth --exclude state.json \
  -e "ssh -o StrictHostKeyChecking=accept-new ${KEY:+-i $KEY}" "$DIR/" "ubuntu@$IP:~/whatsapp-listener/"

"${SSH[@]}" 'bash -s' <<'REMOTE'
set -eo pipefail
# Free-tier VMs have ~1 GB RAM; add 1 GB swap so npm installs never run out of memory.
if [ ! -f /swapfile ]; then
  sudo fallocate -l 1G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile >/dev/null
  sudo swapon /swapfile && echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  # Download first, so a failed fetch stops here instead of installing Ubuntu's old Node 18.
  curl -fsSL --retry 3 -o /tmp/nodesource.sh https://deb.nodesource.com/setup_22.x
  sudo -E bash /tmp/nodesource.sh
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
fi
command -v pm2 >/dev/null || sudo npm i -g pm2
cd ~/whatsapp-listener && npm ci --omit=dev
pm2 delete tollab-listener >/dev/null 2>&1 || true
pm2 start index.mjs --name tollab-listener
pm2 save
sudo env PATH=$PATH pm2 startup systemd -u ubuntu --hp /home/ubuntu >/dev/null
REMOTE

if [ -n "${NO_LOGS:-}" ]; then
  echo "Deployed."; exit 0
fi
echo "Deployed. Showing logs (Ctrl+C to exit; the listener keeps running):"
"${SSH[@]}" 'pm2 logs tollab-listener --lines 30'
