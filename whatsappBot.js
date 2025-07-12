const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");

let sock;

async function startWhatsapp() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');

    sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ["Chrome", "Ubuntu", "10.0"],
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", ({ connection }) => {
        if (connection === "close") {
            console.log("❌ قطع الاتصال، إعادة تشغيل...");
            startWhatsapp();
        }
    });

    console.log("✅ بوت واتساب شغّال");
}

async function getPairingCode(phoneNumber) {
    if (!sock) return null;

    try {
        console.log("🔗 طلب رمز اقتران:", phoneNumber);
        let code = await sock.requestPairingCode(phoneNumber);
        code = code?.match(/.{1,4}/g)?.join("-") || code;

        // تأخير لتفعيل إشعار الجهاز
        await new Promise(r => setTimeout(r, 3000));

        return code;

    } catch (err) {
        console.error("❌ خطأ:", err.message);
        return null;
    }
}

module.exports = {
    startWhatsapp,
    getPairingCode
};
