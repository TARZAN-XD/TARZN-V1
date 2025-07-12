const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");

let sock;

async function startWhatsapp() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');

    sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ["Chrome", "Ubuntu", "10.0"],
        syncFullHistory: false,
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: false,
        emitOwnEvents: true,
        fireInitQueries: true,
        connectTimeoutMs: 60_000,
        defaultQueryTimeoutMs: 0,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection }) => {
        if (connection === "close") {
            console.log("❌ تم قطع الاتصال، جارٍ إعادة الاتصال...");
            startWhatsapp();
        } else if (connection === "open") {
            console.log("✅ تم الاتصال بنجاح.");
        }
    });

    console.log("🚀 بوت واتساب يعمل الآن...");
}

async function getPairingCode(phoneNumber) {
    if (!sock || !sock.requestPairingCode) {
        console.error("⚠️ لم يتم تهيئة الاتصال بعد!");
        return null;
    }

    try {
        if (!phoneNumber.startsWith("+") || phoneNumber.length < 10) {
            throw new Error("📛 الرقم غير صالح. تأكد من إدخاله بصيغة مثل: +9665XXXXXXX");
        }

        let code = await sock.requestPairingCode(phoneNumber);
        if (!code) throw new Error("لم يتم استلام رمز من واتساب");

        code = code.match(/.{1,4}/g)?.join("-") || code;

        await new Promise(r => setTimeout(r, 3000)); // لإظهار إشعار واتساب

        return code;

    } catch (err) {
        console.error("❌ خطأ أثناء توليد الرمز:", err.message);
        return null;
    }
}

module.exports = {
    startWhatsapp,
    getPairingCode
};
