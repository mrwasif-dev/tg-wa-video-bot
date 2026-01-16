const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");

let sock;

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  sock = makeWASocket({
    auth: state,
    browser: ["TG-WA-Bot", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📲 WhatsApp QR scan کرو");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ WhatsApp CONNECTED");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        startWhatsApp();
      } else {
        console.log("❌ WhatsApp logged out");
      }
    }
  });
}

function getWASocket() {
  return sock;
}

module.exports = { startWhatsApp, getWASocket };
