// One-time pairing: links this server to the listener's WhatsApp number.
//   npm run pair            8-letter code   (stop the listener first: pm2 stop tollab-listener)
//   npm run pair -- --qr    QR code instead, written to qr.txt (render it and scan)
//
// Requests ONE pairing code and keeps it valid for up to 5 minutes. The background
// listener never requests codes itself, because every new request voids the last
// code (that is what made earlier codes fail with "Try again").

import makeWASocket, { Browsers, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } from "baileys";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pino from "pino";

const here = dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = join(here, "auth");
for (const line of existsSync(join(here, ".env")) ? readFileSync(join(here, ".env"), "utf8").split("\n") : []) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const useQr = process.argv.includes("--qr");
const phone = process.env.PAIR_PHONE?.replace(/\D/g, "");
if (!useQr && !phone) {
  console.error("Set PAIR_PHONE in .env (country code + number, digits only).");
  process.exit(1);
}

// Start clean: half-finished pairings leave credentials WhatsApp rejects.
rmSync(AUTH_DIR, { recursive: true, force: true });

const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
const { version } = await fetchLatestBaileysVersion();
let codeRequested = false;

setTimeout(() => {
  console.error("\nNo link within 5 minutes. Run `npm run pair` again for a fresh code.");
  process.exit(1);
}, 5 * 60 * 1000);

function connect() {
  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: process.env.LOG_LEVEL || "silent" }),
    browser: Browsers.macOS("Chrome"),
    qrTimeout: 5 * 60 * 1000, // keep the pairing session (and its code) alive
    markOnlineOnConnect: false,
  });
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    // The first QR event means the socket is ready to request a code.
    if (qr && useQr) {
      writeFileSync(join(here, "qr.txt"), qr);
      console.log("QR ready in qr.txt (valid 5 minutes)");
    }
    if (qr && !useQr && !codeRequested && !state.creds.registered) {
      codeRequested = true;
      const code = await sock.requestPairingCode(phone);
      console.log(`\nPAIRING CODE: ${code}\n` +
        "WhatsApp › Settings › Linked devices › Link a device › Link with phone number instead\n" +
        "Waiting up to 5 minutes…");
    }
    if (connection === "open") {
      console.log("\nLINKED ✅  Start the listener: pm2 restart tollab-listener");
      setTimeout(() => process.exit(0), 2000); // let the last credentials flush to disk
    }
    if (connection === "close") {
      const status = lastDisconnect?.error?.output?.statusCode;
      if (status === DisconnectReason.restartRequired || state.creds.registered) {
        connect(); // normal right after a successful link
      } else {
        console.error(`\nConnection closed (${status}). Run \`npm run pair\` again.`);
        process.exit(1);
      }
    }
  });
}

connect();
