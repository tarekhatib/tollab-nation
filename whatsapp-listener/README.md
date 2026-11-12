# WhatsApp channel → live updates

Posts every new Tollab Nation channel post to the site as a live update.

- Takes **only the text** (or an image's caption). Images, links and link previews are dropped.
- **Skips any post with a video.**
- Publishes only posts that have **both Arabic and English**, so promos and one-language posts stay off the site.
- Never publishes the same post twice.

How it works: a secondary WhatsApp number that follows the channel is linked to this
script as a device. The script sends each post to `POST /api/updates/ingest` with
`INGEST_SECRET`, and the site cleans and splits it with the same parser as the admin form.

## Run it

1. Copy `.env.example` to `.env` and fill it in (`INGEST_SECRET` must match Vercel).
2. Deploy: `./whatsapp-listener/deploy.sh <server-ip> [ssh-key]` from the repo root.
3. In the logs, find `PAIRING CODE` (set `PAIR_PHONE`) or the QR code, and link it from the
   listener phone: WhatsApp › Linked devices › Link a device.

On first start it ignores existing channel posts and publishes only new ones from then on.

## Day to day

- Logs: `ssh ubuntu@<ip> pm2 logs tollab-listener`
- Restart: `ssh ubuntu@<ip> pm2 restart tollab-listener`
- `Logged out` in the logs: delete `~/whatsapp-listener/auth` on the server, restart, and pair again.
- After WhatsApp changes something, update Baileys: bump it in `package.json` and deploy again.
