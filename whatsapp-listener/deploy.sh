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
set -e
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
command -v pm2 >/dev/null || sudo npm i -g pm2
cd ~/whatsapp-listener && npm ci --omit=dev
pm2 delete tollab-listener >/dev/null 2>&1 || true
pm2 start index.mjs --name tollab-listener
pm2 save
sudo env PATH=$PATH pm2 startup systemd -u ubuntu --hp /home/ubuntu >/dev/null
REMOTE

echo "Deployed. Showing logs (Ctrl+C to exit; the listener keeps running):"
"${SSH[@]}" 'pm2 logs tollab-listener --lines 30'
