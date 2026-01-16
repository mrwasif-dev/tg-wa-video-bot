const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

// ✅ WhatsApp connector import (یہ لائن نئی ہے)
const { startWhatsApp, getWASocket } = require("./whatsapp");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OWNER_ID = process.env.OWNER_ID;

const app = express();
app.use(express.json());

const bot = new TelegramBot(TELEGRAM_TOKEN);

const PORT = process.env.PORT || 3000;
const URL = "https://tg-wa-video-bot-wasif-38c4260858f1.herokuapp.com";

bot.setWebHook(`${URL}/bot${TELEGRAM_TOKEN}`);

app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.onText(/\/start/, (msg) => {
  if (msg.from.id.toString() !== OWNER_ID) return;
  bot.sendMessage(msg.chat.id, "✅ Bot online (Webhook)");
});

bot.on("video", (msg) => {
  if (msg.from.id.toString() !== OWNER_ID) return;
  bot.sendMessage(msg.chat.id, "🎥 Video receive ho gayi");
});

app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
