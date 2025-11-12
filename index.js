const { Telegraf } = require('telegraf');

const BOT_TOKEN = '7099638631:AAHWoLCmXPsXa3yi-RRhw9htZj-IJEI6FjA';
const bot = new Telegraf(BOT_TOKEN);

// ID учебной группы (замените на реальный)
const GROUP_ID = 'https://t.me/+GFITSpvrpsQxZjcy'; // или '-1001234567890' для приватных групп
// Пример для вашей группы: 
// const GROUP_ID = 'https://t.me/+GFITSpvrpsQxZjcy';

// Обработчик команды /start
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

// Обработчик проверки готовности
bot.action('check_ready', (ctx) => {
  ctx.answerCbQuery().catch(() => {});

  return ctx.editMessageText(
    '🚀 Для старта курса проверьте что:\n' +
    '1. Программа телеграмм установлена на вашем компьютере.\n\n' +
    '👉 Если вы еще не установили программу телеграмм на компьютер, то установите её самостоятельно или посмотрите видео-инструкцию по установке русской версии телеграмм на компьютер.\n\n' +
    '✅ После выполнения условий нажмите кнопку "Продолжить"',
    {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: 'Инструкция', 
            url: 'https://rutube.ru/video/1ee124b1c2b20ca0c471d8e249f4126d/'
          }],
          [{ text: 'Продолжить', callback_data: 'continue_course' }]
        ]
      }
    }
  );
});

// Обработчик продолжения курса - проверка подписки
bot.action('continue_course', async (ctx) => {
  try {
    ctx.answerCbQuery().catch(() => {});
    
    const userId = ctx.from.id;
    
    // Проверяем подписку пользователя на группу
    let isSubscribed = false;
    try {
      const chatMember = await ctx.telegram.getChatMember(GROUP_ID, userId);
      // Если пользователь является участником (member, administrator, creator)
      if (['member', 'administrator', 'creator'].includes(chatMember.status)) {
        isSubscribed = true;
      }
    } catch (error) {
      console.error('Ошибка проверки подписки:', error);
      isSubscribed = false;
    }

    if (isSubscribed) {
      // ✅ Пользователь подписан на группу
      return ctx.editMessageText(
        '✅ Отлично! Успешной учебы',
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Далее', callback_data: 'next_step' }]
            ]
          }
        }
      );
    } else {
      // ❌ Пользователь НЕ подписан на группу
      return ctx.editMessageText(
        '❌ К сожалению мы не нашли вашу подписку на группу курса.\n\n' +
        'Пожалуйста проверьте вашу почту (вместе с чеком оплаты вам пришла ссылка на группу). Подпишитесь на группу и после подписки бот отправит вам материалы курса.\n\n' +
        'Напишите нам при возникновении других вопросов @Irina_Burtseva_333\n\n' +
        '<b>Группа на которую ученик должен быть подписан:</b> https://t.me/+GFITSpvrpsQxZjcy',
        {
          parse_mode: 'HTML',
          disable_web_page_preview: true
        }
      );
    }
  } catch (error) {
    console.error('Ошибка в continue_course:', error);
    return ctx.editMessageText('Произошла ошибка. Попробуйте позже.');
  }
});

// Обработчик кнопки "Далее" (для подписанных пользователей)
bot.action('next_step', (ctx) => {
  ctx.answerCbQuery().catch(() => {});
  return ctx.editMessageText('Отлично! Следующий шаг будет здесь. Присылай скрин №3!');
});

// Обработчик текстовых сообщений
bot.on('text', (ctx) => {
  return ctx.reply('Используйте команду /start для начала работы');
});

// Запуск для Render
const PORT = process.env.PORT || 3000;

bot.launch({
  webhook: {
    domain: 'my-tutor-bot.onrender.com',
    port: PORT
  }
}).then(() => {
  console.log(`✅ Бот запущен на порту ${PORT}`);
}).catch(err => {
  console.error('❌ Ошибка запуска:', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
