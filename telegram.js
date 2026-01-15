const TelegramBot = require("node-telegram-bot-api");
const { TELEGRAM_TOKEN, OWNER_ID } = require("./config");

const bot = new TelegramBot(TELEGRAM_TOKEN, {
  polling: {
    interval: 1000,
    timeout: 30
  }
});

bot.on("polling_error", (e) => {
  console.log("polling error (ignored)");
});

bot.onText(/\/start/, (msg) => {
  if (msg.from.id !== OWNER_ID) return;
  bot.sendMessage(msg.chat.id, "✅ Bot online hai");
});

bot.on("video", (msg) => {
  if (msg.from.id !== OWNER_ID) return;
  bot.sendMessage(msg.chat.id, "🎥 Video receive ho gayi");
});

console.log("Telegram bot started...");
