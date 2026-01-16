const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys')

const qrcode = require('qrcode-terminal')
const fs = require('fs')

async function startWhatsApp () {
  // session folder (delete مت کرنا)
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // deprecated option off
    browser: ['WhatsApp Bot', 'Chrome', '1.0.0']
  })

  // save session
  sock.ev.on('creds.update', saveCreds)

  // connection updates
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    // QR show (box format)
    if (qr) {
      console.log('📲 Scan this QR from WhatsApp → Linked Devices')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log('✅ WhatsApp CONNECTED & LINKED')
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode

      if (reason === DisconnectReason.loggedOut) {
        console.log('❌ WhatsApp logged out. Session invalid.')
        console.log('⚠️ Session delete کرو اور دوبارہ QR scan کرو')
      } else {
        console.log('⚠️ Connection closed. Reconnecting...')
        startWhatsApp()
      }
    }
  })

  // OPTIONAL: incoming messages listener (safe)
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    console.log('📩 New message from:', msg.key.remoteJid)
  })
}

// start bot
startWhatsApp()
