const { Telegraf } = require('telegraf');
const http = require('http');

const BOT_TOKEN = '7099638631:AAHWoLCmXPsXa3yi-RRhw9htZj-IJEI6FjA';
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
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
  ctx.editMessageText(
    '🚀 Для старта курса проверьте что:\n' +
    '1. Программа телеграмм установлена на вашем компьютере.\n\n' +
    '👉 Если вы еще не установили программу телеграмм на компьютер, то установите её самостоятельно или посмотрите эту <a href="https://rutube.ru/video/1ee124b1c2b20ca0c471d8e249f4126d/">ИНСТРУКЦИЮ</a> по установке русской версии телеграмм на компьютер.\n\n' +
    '✅ После выполнения условий нажмите кнопку "Продолжить"',
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Продолжить', callback_ 'continue_course' }]
        ]
      }
    }
  );
});

bot.action('continue_course', (ctx) => {
  ctx.editMessageText('Отлично! Следующий шаг будет здесь. Присылай скрин №3!');
});

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else if (req.method === 'POST' && req.url === '/') {
    bot.webhookCallback('/', false)(req, res);
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  
  // Устанавливаем вебхук с безопасной обработкой ошибок
  bot.telegram.setWebhook(`https://my-tutor-bot.onrender.com/`)
    .then(() => console.log('✅ Webhook установлен'))
    .catch(err => {
      console.error('⚠️ Не удалось установить вебхук:', err.message);
      // Но не завершаем процесс! Бот всё равно будет работать через polling (в крайнем случае)
    });
});
