const { Telegraf } = require('telegraf');
const http = require('http');

const BOT_TOKEN = '7099638631:AAHWoLCmXPsXa3yi-RRhw9htZj-IJEI6FjA';
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  return ctx.reply(
    'Добро пожаловать на курс! Давайте проверим, готовы ли вы к прохождению?',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Проверить', callback_ 'check_ready' }]
        ]
      }
    }
  );
});

bot.action('check_ready', (ctx) => {
  ctx.editMessageText('✅ Готовы! Начинаем...');
});

// Создаём HTTP-сервер ВРУЧНУЮ
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    // Render периодически проверяет этот путь — отвечаем быстро и просто
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  if (req.method === 'POST' && req.url === '/') {
    // Передаём запрос Telegram в Telegraf
    bot.webhookCallback('/', false)(req, res);
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  // Устанавливаем вебхук — ОБЯЗАТЕЛЬНО с правильным URL
  bot.telegram.setWebhook(`https://my-tutor-bot.onrender.com/`).catch(console.error);
});
