const { Telegraf } = require('telegraf');

// 🔑 ВСТАВЬ СВОЙ ТОКЕН ОТ @BotFather ВМЕСТО ЭТОЙ СТРОКИ!
const BOT_TOKEN = '7099638631:AAHWoLCmXPsXa3yi-RRhw9htZj-IJEI6FjA';
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  return ctx.reply(
    'Привет! 👋\nВыбери тему:',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎨 Основы дизайна', callback_data: 'design' }],
          [{ text: '🎥 Видеоурок', callback_data: 'video' }],
          [{ text: '❓ Тест', callback_data: 'test' }]
        ]
      }
    }
  );
});

bot.action('design', (ctx) => {
  ctx.editMessageText('🎨 Основы графического дизайна:\n— Цвет\n— Композиция\n— Типографика');
});

bot.action('video', (ctx) => {
  ctx.editMessageText('🎥 Вот видеоурок: [ссылка на Rutube/Яндекс.Диск]');
});

bot.action('test', (ctx) => {
  ctx.editMessageText(
    '❓ Вопрос 1: Что такое композиция?\n\nВыбери правильный ответ:',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'А) Расположение элементов', callback_data: 'ans_a' }],
          [{ text: 'Б) Цвет фона', callback_data: 'ans_b' }]
        ]
      }
    }
  );
});

bot.action('ans_a', (ctx) => {
  ctx.editMessageText('✅ Верно!');
});

bot.action('ans_b', (ctx) => {
  ctx.editMessageText('❌ Неверно. Попробуй ещё раз!');
});

const PORT = process.env.PORT || 3000;
bot.launch({ webhookPath: '/', port: PORT });
console.log(`✅ Бот запущен на порту ${PORT}`);
