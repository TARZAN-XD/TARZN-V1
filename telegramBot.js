require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { startWhatsapp, getPairingCode } = require("./whatsappBot");

const bot = new TelegramBot(process.env.TG_TOKEN, { polling: true });

(async () => {
    await startWhatsapp();
    console.log("🚀 تم تشغيل بوت واتساب");
})();

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "👋 أرسل رقم الهاتف لطلب رمز اقتران واتساب، مثال:\n`+9665XXXXXXX`", { parse_mode: 'Markdown' });
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text.startsWith('+') && text.length > 10) {
        bot.sendMessage(chatId, "⏳ يتم الآن توليد الرمز...");
        const code = await getPairingCode(text);
        if (code) {
            bot.sendMessage(chatId, `✅ رمز الاقتران:\n\`${code}\``, { parse_mode: 'Markdown' });
        } else {
            bot.sendMessage(chatId, "❌ فشل في توليد الرمز. تأكد من صحة الرقم.");
        }
    }
});
