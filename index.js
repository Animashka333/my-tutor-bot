const { Telegraf } = require('telegraf');
const http = require('http');

// 🔑 Твой токен (уже вставлен)
const BOT_TOKEN = '7099638631:AAHWoLCmXPsXa3yi-RRhw9htZj-IJEI6FjA';
const bot = new Telegraf(BOT_TOKEN);

// Главное меню — первый шаг из твоего скриншота
bot.start((ctx) => {
  return ctx.reply(
    'Добро пожаловать на курс! Давайте проверим, готовы ли вы к прохождению?',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Проверить', callback_data: 'check_ready' }]
        ]
      }
    }
  );
});

// Обработка нажатия на кнопку "Проверить"
bot.action('check_ready', (ctx) => {
  ctx.editMessageText('Отлично! Вы нажали "Проверить".');
});

// 🔥 Критически важная часть: HTTP-сервер для Render
const server = http.createServer((req, res) => {
  // Render проверяет корень — отвечаем OK
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is alive!');
  }
  // Обработка вебхуков от Telegram
  else if (req.method === 'POST' && req.url === '/') {
    bot.webhookCallback('/', false)(req, res);
  }
  else {
    res.writeHead(404);
    res.end();
  }
});

// Запуск сервера на порту от Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Бот запущен на порту ${PORT}`);
  // Регистрируем вебхук (автоматически подставится правильный URL)
  bot.telegram.setWebhook(`https://my-tutor-bot.onrender.com/`);
});
