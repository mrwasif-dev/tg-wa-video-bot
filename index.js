const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const { startWhatsApp, getWASocket } = require("./whatsapp");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OWNER_ID = process.env.OWNER_ID;
// مثال: WA_TARGET=923xxxxxxxx@s.whatsapp.net,12036xxxx@g.us
const WA_TARGET = process.env.WA_TARGET;

const app = express();
app.use(express.json());

const bot = new TelegramBot(TELEGRAM_TOKEN);

const PORT = process.env.PORT || 3000;
const URL = "https://tg-wa-video-bot-wasif-38c4260858f1.herokuapp.com";

// Telegram webhook
bot.setWebHook(`${URL}/bot${TELEGRAM_TOKEN}`);

app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// /start
bot.onText(/\/start/, (msg) => {
  if (msg.from.id.toString() !== OWNER_ID) return;
  bot.sendMessage(msg.chat.id, "✅ Telegram → WhatsApp bridge online");
});

// 🎥 Telegram → WhatsApp (video)
bot.on("video", async (msg) => {
  if (msg.from.id.toString() !== OWNER_ID) return;

  const sock = getWASocket();
  if (!sock) {
    return bot.sendMessage(msg.chat.id, "❌ WhatsApp connected nahi hai");
  }

  await bot.sendMessage(msg.chat.id, "📤 WhatsApp par send ho rahi hai...");

  const fileId = msg.video.file_id;
  const file = await bot.getFile(fileId);
  const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${file.file_path}`;

  // 🔴 MULTI TARGET SUPPORT
  const targets = WA_TARGET.split(",");

  for (const jid of targets) {
    await sock.sendMessage(
      jid.trim(),
      {
        video: { url: fileUrl },
        caption: "📹 From Telegram Bot"
      }
    );
  }

  bot.sendMessage(msg.chat.id, "✅ WhatsApp par send ho gayi");
});

// health check
app.get("/", (req, res) => {
  res.send("Bot running");
});

app.listen(PORT, () => {
  console.log("🚀 Server running on", PORT);
});

// 🔥 WhatsApp start
startWhatsApp();
