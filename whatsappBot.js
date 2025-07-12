const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");

let sock;

async function startWhatsapp() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state,
        printQRInTerminal: true, // مؤقتًا لأجل أول اتصال
        browser: ["Tarzan", "Chrome", "10.0"]
    });

    sock.ev.on("creds.update", saveCreds);
}

async function getPairingCode(number) {
    if (!sock) return null;
    try {
        let code = await sock.requestPairingCode(number);
        return code?.match(/.{1,4}/g)?.join("-") || code;
    } catch (err) {
        console.error("خطأ في توليد الكود:", err);
        return null;
    }
}

module.exports = {
    startWhatsapp,
    getPairingCode
};
