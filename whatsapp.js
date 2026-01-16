const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");

let sockInstance = null;

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ["WhatsApp Bot", "Chrome", "1.0.0"]
  });

  sockInstance = sock;

  // save session
  sock.ev.on("creds.update", saveCreds);

  // connection updates
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📲 Scan this QR from WhatsApp → Linked Devices");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ WhatsApp CONNECTED & LINKED");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason === DisconnectReason.loggedOut) {
        console.log("❌ WhatsApp logged out. Session invalid.");
      } else {
        console.log("♻️ Reconnecting WhatsApp...");
        startWhatsApp();
      }
    }
  });

  return sock;
}

function getWASocket() {
  return sockInstance;
}

module.exports = {
  startWhatsApp,
  getWASocket
};
