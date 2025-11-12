const { Telegraf } = require('telegraf');
const http = require('http');

const BOT_TOKEN = '7099638631:AAHWoLCmXPsXa3yi-RRhw9htZj-IJEI6FjA';
const bot = new Telegraf(BOT_TOKEN);

// Обработчик команды /start
bot.start((ctx) => {
  return ctx.reply(
    'Добро пожаловать на курс! Давайте проверим, готовы ли вы к прохождению?',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Проверить', callback_data: 'check_ready' }] // ДОБАВЛЕНО двоеточие!
        ]
      }
    }
  );
});

// Обработчик проверки готовности
bot.action('check_ready', (ctx) => {
  // Обязательно отвечаем на callback запрос
  ctx.answerCbQuery().catch(() => {}); // Игнорируем ошибки, если запрос уже обработан
  
  return ctx.editMessageText(
    '🚀 Для старта курса проверьте что:\n' +
    '1. Программа телеграмм установлена на вашем компьютере.\n\n' +
    '👉 Если вы еще не установили программу телеграмм на компьютер, то установите её самостоятельно или посмотрите эту <a href="https://rutube.ru/video/1ee124b1c2b20ca0c471d8e249f4126d/">ИНСТРУКЦИЮ</a> по установке русской версии телеграмм на компьютер.\n\n' +
    '✅ После выполнения условий нажмите кнопку "Продолжить"',
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Продолжить', callback_data: 'continue_course' }] // ДОБАВЛЕНО двоеточие!
        ]
      }
    }
  );
});

// Обработчик продолжения курса
bot.action('continue_course', (ctx) => {
  ctx.answerCbQuery().catch(() => {});
  return ctx.editMessageText('Отлично! Следующий шаг будет здесь. Присылай скрин №3!');
});

// Обработчик текстовых сообщений
bot.on('text', (ctx) => {
  return ctx.reply('Используйте команду /start для начала работы');
});

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running!');
  } else if (req.method === 'POST' && req.url === `/${BOT_TOKEN}`) {
    // Для вебхуков Telegram отправляет запросы на /<token>
    bot.webhookCallback(`/${BOT_TOKEN}`)(req, res);
  } else if (req.method === 'POST' && req.url === '/') {
    // Альтернативный endpoint
    bot.webhookCallback('/')(req, res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  
  // Для Render лучше использовать встроенный launch с вебхуком
  const webhookUrl = `https://my-tutor-bot.onrender.com/${BOT_TOKEN}`;
  
  bot.launch({
    webhook: {
      domain: 'my-tutor-bot.onrender.com',
      port: PORT,
      hookPath: `/${BOT_TOKEN}`
    }
  }).then(() => {
    console.log('✅ Бот запущен в режиме вебхука');
  }).catch(err => {
    console.error('❌ Ошибка запуска бота:', err.message);
    // Запускаем в режиме polling как fallback
    console.log('🔄 Пытаемся запустить в режиме polling...');
    bot.launch().then(() => {
      console.log('✅ Бот запущен в режиме polling');
    }).catch(pollingErr => {
      console.error('❌ Критическая ошибка:', pollingErr.message);
    });
  });
});

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('🛑 Остановка бота...');
  bot.stop('SIGINT');
  server.close();
});

process.once('SIGTERM', () => {
  console.log('🛑 Остановка бота...');
  bot.stop('SIGTERM');
  server.close();
});
