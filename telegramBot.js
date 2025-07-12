require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { startWhatsapp, getPairingCode } = require("./whatsappBot");

const bot = new TelegramBot(process.env.TG_TOKEN, { polling: true });

(async () => {
    await startWhatsapp();
})();

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "👋 مرحبًا! أرسل رقم واتساب مع كود الدولة لطلب رمز الاقتران.\nمثال:\n`+9665XXXXXXX`", { parse_mode: "Markdown" });
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text.startsWith('+') || text.length < 10) return;

    bot.sendMessage(chatId, "⏳ جاري توليد الرمز، انتظر قليلًا...");

    const code = await getPairingCode(text);
    if (code) {
        bot.sendMessage(chatId, `✅ رمز الاقتران:\n\`${code}\`\n\n📌 ادخل هذا الرمز في:\nواتساب > الأجهزة المرتبطة > ربط جهاز > إدخال رمز`, { parse_mode: "Markdown" });
    } else {
        bot.sendMessage(chatId, "❌ فشل في توليد الرمز. تأكد من صحة الرقم.");
    }
});
