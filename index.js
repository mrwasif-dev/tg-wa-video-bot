const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const { startWhatsApp, getWASocket } = require("./whatsapp");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OWNER_ID = process.env.OWNER_ID;

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

// start command
bot.onText(/\/start/, (msg) => {
  if (msg.from.id.toString() !== OWNER_ID) return;
  bot.sendMessage(msg.chat.id, "✅ Telegram + WhatsApp bridge online");
});

// 🎥 Telegram → WhatsApp (video forward)
bot.on("video", async (msg) => {
  if (msg.from.id.toString() !== OWNER_ID) return;

  const sock = getWASocket();
  if (!sock) {
    return bot.sendMessage(msg.chat.id, "❌ WhatsApp not connected");
  }

  await bot.sendMessage(msg.chat.id, "📤 WhatsApp پر بھیج رہا ہوں...");

  const fileId = msg.video.file_id;
  const file = await bot.getFile(fileId);
  const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${file.file_path}`;

  await sock.sendMessage(
    process.env.WA_TARGET, // WhatsApp number or group JID
    {
      video: { url: fileUrl },
      caption: "📹 From Telegram Bot"
    }
  );

  bot.sendMessage(msg.chat.id, "✅ WhatsApp پر بھیج دی گئی");
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
