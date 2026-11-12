// Tollab Nation WhatsApp channel → website live updates.
//
// Runs as a linked device on a secondary WhatsApp number that follows the channel.
// For each new channel post it takes ONLY the text (or image caption), skips any
// post that carries a video, and sends the text to /api/updates/ingest. The site
// does the Arabic/English split and cleanup, exactly like a manual paste.
//
// Two delivery paths, so a missed live push does not lose a post:
//   1. live:  messages.upsert events for the channel
//   2. poll:  every POLL_SECONDS, fetch the latest posts and send any unseen ones
// Every post is tracked by its channel server_id in state.json, and the site also
// refuses duplicates, so nothing is published twice.

import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  getBinaryNodeChild,
  getBinaryNodeChildBuffer,
  getBinaryNodeChildren,
  normalizeMessageContent,
  proto,
  useMultiFileAuthState,
} from "baileys";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pino from "pino";
import qrcode from "qrcode-terminal";

const here = dirname(fileURLToPath(import.meta.url));
loadEnv(join(here, ".env"));

const SITE_URL = required("SITE_URL").replace(/\/$/, "");
const INGEST_SECRET = required("INGEST_SECRET");
const CHANNEL = required("CHANNEL_LINK"); // https://whatsapp.com/channel/<code>
const PAIR_PHONE = process.env.PAIR_PHONE?.replace(/\D/g, ""); // optional: pair by code instead of QR
const POLL_SECONDS = Number(process.env.POLL_SECONDS || 60);
const HEARTBEAT_URL = process.env.HEARTBEAT_URL; // optional: e.g. a healthchecks.io ping URL

const STATE_FILE = join(here, "state.json");
const AUTH_DIR = join(here, "auth");
const log = pino({ level: process.env.LOG_LEVEL || "info" });

/** server_ids already handled. Capped so the file never grows without limit. */
const state = existsSync(STATE_FILE)
  ? JSON.parse(readFileSync(STATE_FILE, "utf8"))
  : { channelJid: null, seen: [], baselined: false };
const seen = new Set(state.seen);
function saveState() {
  state.seen = [...seen].slice(-500);
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}
function markSeen(id) {
  seen.add(id);
  saveState();
}

let pollTimer;
let liveTimer;

async function start() {
  const { state: auth, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    auth,
    logger: log.child({ module: "baileys" }, { level: "warn" }),
    browser: Browsers.macOS("Desktop"),
    markOnlineOnConnect: false,
    syncFullHistory: false,
  });
  sock.ev.on("creds.update", saveCreds);

  if (PAIR_PHONE && !sock.authState.creds.registered) {
    setTimeout(async () => {
      const code = await sock.requestPairingCode(PAIR_PHONE);
      log.info(`PAIRING CODE: ${code}  → WhatsApp › Linked devices › Link with phone number`);
    }, 3000);
  }

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (qr && !PAIR_PHONE) {
      log.info("Scan this QR in WhatsApp › Linked devices › Link a device:");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "open") {
      log.info("Connected to WhatsApp");
      try {
        await onConnected(sock);
      } catch (err) {
        log.error({ err }, "Channel setup failed");
      }
    }
    if (connection === "close") {
      clearInterval(pollTimer);
      clearInterval(liveTimer);
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        log.fatal("Logged out from the phone. Delete the auth/ folder and pair again.");
        process.exit(1);
      }
      log.warn({ code }, "Disconnected, reconnecting in 5s");
      setTimeout(start, 5000);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (msg.key.remoteJid !== state.channelJid) continue;
      const id = msg.key.server_id || msg.key.id;
      await handle(id, msg.message);
    }
  });
}

async function onConnected(sock) {
  if (!state.channelJid) {
    const invite = CHANNEL.split("/channel/")[1]?.split(/[/?#]/)[0] || CHANNEL;
    const meta = await sock.newsletterMetadata("invite", invite);
    if (!meta?.id) throw new Error(`Channel not found for ${CHANNEL}`);
    state.channelJid = meta.id;
    saveState();
    log.info({ jid: meta.id }, "Channel resolved");
  }
  await sock.newsletterFollow(state.channelJid).catch(() => {}); // already following is fine

  // First run only: mark existing posts as seen so old news is not re-published.
  if (!state.baselined) {
    for (const { id } of await fetchLatest(sock)) seen.add(id);
    state.baselined = true;
    saveState();
    log.info(`Baseline set (${seen.size} existing posts ignored)`);
  }

  const subscribe = () =>
    sock.subscribeNewsletterUpdates(state.channelJid).catch((err) => log.warn({ err }, "Live subscribe failed"));
  await subscribe();
  liveTimer = setInterval(subscribe, 4 * 60 * 1000); // live subscriptions expire; renew

  const poll = async () => {
    try {
      for (const { id, message } of (await fetchLatest(sock)).reverse()) await handle(id, message);
      if (HEARTBEAT_URL) fetch(HEARTBEAT_URL).catch(() => {});
    } catch (err) {
      log.warn({ err }, "Poll failed");
    }
  };
  await poll();
  pollTimer = setInterval(poll, POLL_SECONDS * 1000);
}

/** Latest channel posts as { id, message }, newest first as the server returns them. */
async function fetchLatest(sock) {
  const res = await sock.newsletterFetchMessages(state.channelJid, 20, undefined, undefined);
  const updates = getBinaryNodeChild(res, "message_updates") ?? getBinaryNodeChild(res, "messages") ?? res;
  const list = getBinaryNodeChild(updates, "messages") ?? updates;
  return getBinaryNodeChildren(list, "message")
    .map((node) => {
      const buf = getBinaryNodeChildBuffer(node, "plaintext");
      return buf ? { id: node.attrs.server_id, message: proto.Message.decode(buf) } : null;
    })
    .filter((m) => m?.id);
}

async function handle(id, rawMessage) {
  if (!id || seen.has(id)) return;
  const m = normalizeMessageContent(rawMessage);
  if (!m || m.protocolMessage || m.reactionMessage) return; // edits, deletes, reactions

  const hasVideo = Boolean(m.videoMessage || m.ptvMessage);
  const text =
    m.conversation ||
    m.extendedTextMessage?.text || // text, including posts with a link preview
    m.imageMessage?.caption || // image posts: caption only, never the image
    "";

  if (hasVideo) {
    log.info({ id }, "Skipped: post has a video");
    return markSeen(id);
  }
  if (!text.trim()) return markSeen(id); // sticker, voice note, image without caption

  try {
    const res = await fetch(`${SITE_URL}/api/updates/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${INGEST_SECRET}` },
      body: JSON.stringify({ text, hasVideo }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 401) {
      log.error("Website rejected INGEST_SECRET. Check it matches the Vercel env var.");
      return; // not marked seen, so it retries once the key is fixed
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} ${JSON.stringify(body)}`);
    log.info({ id, ...body }, body.published ? "Published" : "Not published");
    markSeen(id);
  } catch (err) {
    log.error({ err, id }, "Send failed, will retry on next poll"); // not marked seen
  }
}

function required(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing ${name} in whatsapp-listener/.env (see .env.example)`);
    process.exit(1);
  }
  return v;
}

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

start();
