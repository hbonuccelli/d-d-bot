const wppconnect = require('@wppconnect-team/wppconnect');

wppconnect
  .create({
    session: 'rpg-bot',
    headless: true,
    useChrome: false,
    puppeteerOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    catchQR: (base64Qr, asciiQR, attempts) => {
      console.clear();
      console.log('📱 Escaneie o QR Code abaixo no WhatsApp:');
      console.log(asciiQR);
    }
  })
  .then((client) => {
    // ✅ Aqui dentro o client está definido
    client.getHostDevice().then((info) => {
        console.log('📱 Informações do dispositivo:', info);

        if (info?.wid?.user) {
            console.log(`📱 Número do bot: ${info.wid.user}`);
        } else {
            console.warn('⚠️ Não foi possível obter o número do bot.');
        }
    });

    start(client);
  })
  .catch((error) => console.error('Erro ao iniciar WPPConnect:', error));

function start(client) {
  client.onMessage(async (message) => {
    if (!message.isGroupMsg || !message.body) return;

    const commandRegex = /^\/r\s+(\d*)d(\d+)([+-]\d+)?$/i;
    const match = message.body.trim().match(commandRegex);
    if (!match) return;

    const quantity = parseInt(match[1]) || 1;
    const faces = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;

    if (quantity > 100 || faces > 1000) {
      await client.sendText(message.from, '⚠️ Número de dados ou faces muito alto!');
      return;
    }

    const rolls = [];
    for (let i = 0; i < quantity; i++) {
      rolls.push(Math.floor(Math.random() * faces) + 1);
    }

    const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
    const rollsStr = rolls.join(', ');
    const modifierStr = modifier !== 0 ? ` ${modifier > 0 ? '+' : '-'} ${Math.abs(modifier)}` : '';

    const resultMessage = `🎲 *Rolagem: /r ${quantity}d${faces}${modifierStr}*\n` +
                          `• Resultados: [ ${rollsStr} ]\n` +
                          `• Total: *${total}*`;

    await client.sendText(message.from, resultMessage);
  });
}