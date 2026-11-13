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
  isJidNewsletter,
  normalizeMessageContent,
  proto,
  useMultiFileAuthState,
} from "baileys";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pino from "pino";

const here = dirname(fileURLToPath(import.meta.url));
loadEnv(join(here, ".env"));

const SITE_URL = required("SITE_URL").replace(/\/$/, "");
const INGEST_SECRET = required("INGEST_SECRET");
const CHANNEL = required("CHANNEL_LINK"); // https://whatsapp.com/channel/<code>
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

/** Stay alive without reconnecting, so pm2 does not restart-loop while unlinked. */
function idle(message) {
  log.fatal(message);
  setInterval(() => {}, 1 << 30);
}

async function start() {
  const { state: auth, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  // creds.me exists once linked by QR or code (`registered` is only set by the code flow).
  if (!auth.creds.me?.id) {
    return idle("Not linked to WhatsApp yet. Run: pm2 stop tollab-listener && npm run pair");
  }
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    auth,
    logger: log.child({ module: "baileys" }, { level: "warn" }),
    browser: Browsers.macOS("Chrome"), // same identity as pair.mjs
    markOnlineOnConnect: false,
    syncFullHistory: false,
    // Only channels matter; skip decrypting this number's groups and private chats.
    shouldIgnoreJid: (jid) => !isJidNewsletter(jid),
  });
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
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
        return idle("Logged out from the phone. Run: pm2 stop tollab-listener && npm run pair");
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
      for (const { id, message } of await fetchLatest(sock)) await handle(id, message); // oldest first
      if (HEARTBEAT_URL) fetch(HEARTBEAT_URL).catch(() => {});
    } catch (err) {
      log.warn({ err }, "Poll failed");
    }
  };
  await poll();
  pollTimer = setInterval(poll, POLL_SECONDS * 1000);
}

/** Latest channel posts as { id, message }, oldest first as the server returns them.
 *  message is null when a post carries no readable content; it still counts for the baseline. */
async function fetchLatest(sock) {
  const started = Date.now();
  // Baileys 7's newsletterFetchMessages gets no reply from WhatsApp; this is the request
  // shape WhatsApp Web uses (and Baileys 6 sent), which does.
  const res = await sock.query({
    tag: "iq",
    attrs: { id: sock.generateMessageTag(), type: "get", xmlns: "newsletter", to: "s.whatsapp.net" },
    content: [{ tag: "messages", attrs: { type: "jid", jid: state.channelJid, count: "20" } }],
  }, 20_000);
  if (process.env.DEBUG_FETCH) {
    const shape = (n, d = 0) => n && typeof n === "object" && n.tag
      ? { tag: n.tag, attrs: n.attrs, ...(d < 4 && Array.isArray(n.content) ? { content: n.content.slice(0, 3).map((c) => shape(c, d + 1)) } : { bytes: n.content?.length }) }
      : typeof n;
    log.info({ ms: Date.now() - started, shape: shape(res) }, "fetch result");
  }
  const updates = getBinaryNodeChild(res, "message_updates") ?? getBinaryNodeChild(res, "messages") ?? res;
  const list = getBinaryNodeChild(updates, "messages") ?? updates;
  return getBinaryNodeChildren(list, "message")
    .map((node) => {
      const buf = getBinaryNodeChildBuffer(node, "plaintext");
      if (process.env.DEBUG_FETCH) {
        const m = buf ? normalizeMessageContent(proto.Message.decode(buf)) : null;
        const text = m?.conversation || m?.extendedTextMessage?.text || m?.imageMessage?.caption || "";
        log.info({ id: node.attrs.server_id, kinds: m ? Object.keys(m) : [], video: Boolean(m?.videoMessage || m?.ptvMessage), text: Array.from(text).slice(0, 90).join("") }, "post");
      }
      return { id: node.attrs.server_id, message: buf ? proto.Message.decode(buf) : null };
    })
    .filter((m) => m.id);
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
