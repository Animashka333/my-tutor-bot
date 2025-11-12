const { Telegraf } = require('telegraf');
const express = require('express');

const BOT_TOKEN = '7099638631:AAHWoLCmXPsXa3yi-RRhw9htZj-IJEI6FjA';
const bot = new Telegraf(BOT_TOKEN);
const app = express();

// ==================== ПИНГ-ЭНДПОИНТЫ ДЛЯ UPTIMEROBOT ====================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Tutor Bot</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .status { color: green; font-weight: bold; }
        </style>
    </head>
    <body>
        <h1>🤖 Tutor Bot Active</h1>
        <p>Status: <span class="status">✅ Running</span></p>
        <p>Time: ${new Date().toISOString()}</p>
        <p>Uptime: ${Math.floor(process.uptime())} seconds</p>
        <p><a href="/ping">Ping Check</a> | <a href="/health">Health Check</a></p>
    </body>
    </html>
  `);
});

app.get('/ping', (req, res) => {
  res.json({ 
    status: 'pong', 
    timestamp: new Date().toISOString(),
    service: 'tutor-bot',
    uptime: Math.floor(process.uptime()) + ' seconds'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    bot: 'online', 
    timestamp: new Date().toISOString(),
    platform: process.platform,
    node_version: process.version
  });
});

// ==================== КОНФИГУРАЦИЯ ====================

// ID приватной группы
const GROUP_ID = '-1002008510442';

// Ссылки
const GROUP_LINK = 'https://t.me/+GFITSpvrpsQxZjcy';
const TEACHER_USERNAME = '@Irina_Burtseva_333';
const PRESENTATIONS_LINK = 'https://drive.google.com/drive/folders/1Xz5U6rU_IKscuTj3n1_xqWdITkDMVD00?usp=sharing';

// File ID картинки учителя
const PHOTO_FILE_ID = 'AgACAgIAAxkBAAIK6GkUazRfErq8pL3GPs_s6f9aZvIRAAKYD2sbx7ygSLgE5jB6RB5qAQADAgADeQADNgQ';

// File ID для Урока 1
const LESSON_1_VIDEO_ID = 'BAACAgIAAxkBAAILEmkUcZ8uZ_OqxCOvMLHMxscHMT1hAALWhAACx7yoSAABJZ0DfMLJwzYE';
const LESSON_1_PRESENTATION_ID = 'BQACAgIAAxkBAAILEGkUcXSoiRSVlLTghiLfcgpaOZXrAALThAACx7yoSCH7jmZckm_FNgQ';
const KEYBOARD_IMAGE_ID = 'AgACAgIAAxkBAAILAAFpFG_ClIIPp47f5Q7gVQgCXI6IOgACFgtrG8e8qEh2VPMhVfW90gEAAwIAA3gAAzYE';

// ==================== ОСНОВНОЙ КОД БОТА ====================

// ОСНОВНОЙ ОБРАБОТЧИК /start
bot.start((ctx) => {
  console.log('✅ /start команда получена от:', ctx.from.first_name);
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
  console.log('✅ check_ready нажата');

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
    console.log('✅ continue_course нажата');
    
    const userId = ctx.from.id;
    
    let isSubscribed = false;
    try {
      const chatMember = await ctx.telegram.getChatMember(GROUP_ID, userId);
      if (['member', 'administrator', 'creator'].includes(chatMember.status)) {
        isSubscribed = true;
      }
    } catch (error) {
      console.error('Ошибка проверки подписки:', error);
      isSubscribed = false;
    }

    if (isSubscribed) {
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
      return ctx.editMessageText(
        '❌ К сожалению мы не нашли вашу подписку на группу курса.\n\n' +
        'Пожалуйста проверьте вашу почту (вместе с чеком оплаты вам пришла ссылка на группу). Подпишитесь на группу и после подписки бот отправит вам материалы курса.\n\n' +
        'Напишите нам при возникновении других вопросов @Irina_Burtseva_333',
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

// Обработчик кнопки "Далее" - приветствие
bot.action('next_step', async (ctx) => {
  try {
    ctx.answerCbQuery().catch(() => {});
    console.log('✅ next_step нажата');
    
    await ctx.replyWithPhoto(
      PHOTO_FILE_ID,
      {
        caption: `Привет! Меня зовут Ирина Бурцева, я твой учитель! Мы будем изучать как устроен компьютер и что в нем можно делать.`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Написать в группу для вопросов', url: GROUP_LINK }],
            [{ text: 'Написать учителю лично', url: `https://t.me/${TEACHER_USERNAME.replace('@', '')}` }]
          ]
        }
      }
    );
    
    await ctx.reply(
      `Вы можете скачать презентации к каждому уроку или смотреть их в режиме онлайн тут (требуется гугл аккаунт):`,
      {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Все презентации к урокам', url: PRESENTATIONS_LINK }]
          ]
        }
      }
    );
    
    await ctx.reply(
      `Чтобы открыть урок жми на кнопку Урок 1 👇`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Урок 1', callback_data: 'lesson_1' }]
          ]
        }
      }
    );
    
  } catch (error) {
    console.error('Ошибка в next_step:', error);
    return ctx.reply('Произошла ошибка при загрузке материалов.');
  }
});

// Обработчик Урока 1 - ПОЛНЫЙ КОНТЕНТ
bot.action('lesson_1', async (ctx) => {
  try {
    ctx.answerCbQuery().catch(() => {});
    console.log('✅ lesson_1 нажата');
    
    await ctx.replyWithVideo(
      LESSON_1_VIDEO_ID,
      {
        caption: `🎬 А вот и первый урок! 😊\n\n<b>Тема:</b> <b>Как человек и компьютер воспринимают информацию</b>\n\nКогда посмотришь его, жми на кнопку "Просмотрено"`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ Просмотрено', callback_data: 'lesson_1_watched' }]
          ]
        }
      }
    );
    
  } catch (error) {
    console.error('Ошибка при отправке видео:', error);
    return ctx.reply('Произошла ошибка при загрузке видео урока.');
  }
});

// Обработчик кнопки "Просмотрено" после видео
bot.action('lesson_1_watched', async (ctx) => {
  try {
    ctx.answerCbQuery().catch(() => {});
    console.log('✅ lesson_1_watched нажата');
    
    await ctx.replyWithDocument(
      LESSON_1_PRESENTATION_ID,
      {
        caption: `📎 <b>Презентация к уроку 1</b>`,
        parse_mode: 'HTML'
      }
    );
    
    await ctx.replyWithPhoto(
      KEYBOARD_IMAGE_ID,
      {
        caption: `⌨️ <b>Дополнительный файл к уроку 1</b>\nГде какие кнопки?`,
        parse_mode: 'HTML'
      }
    );
    
    await ctx.reply(
      `Когда всё посмотришь и выполнишь задания, жми на кнопку "Просмотрено" 👇`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ Всё просмотрено, иду дальше', callback_data: 'lesson_1_completed' }]
          ]
        }
      }
    );
    
  } catch (error) {
    console.error('Ошибка в lesson_1_watched:', error);
    return ctx.reply('Произошла ошибка при загрузке материалов.');
  }
});

// Обработчик завершения Урока 1
bot.action('lesson_1_completed', (ctx) => {
  ctx.answerCbQuery().catch(() => {});
  console.log('✅ lesson_1_completed нажата');
  return ctx.reply(
    '🎉 Поздравляю с завершением Урока 1!\n\nСледующий урок будет доступен скоро...',
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Урок 2', callback_data: 'lesson_2' }]
        ]
      }
    }
  );
});

// Обработчик текстовых сообщений
bot.on('text', (ctx) => {
  console.log('Текст получен:', ctx.message.text);
  if (!ctx.message.text.startsWith('/')) {
    return ctx.reply('Используйте команду /start для начала работы');
  }
});

// ==================== ВРЕМЕННЫЙ КОД ДЛЯ FILE_ID ====================
bot.on('video', (ctx) => {
  if (!ctx.message.reply_to_message) {
    const fileId = ctx.message.video.file_id;
    ctx.reply(`🎬 File ID видео: ${fileId}`);
  }
});

bot.on('document', (ctx) => {
  if (!ctx.message.reply_to_message) {
    const fileId = ctx.message.document.file_id;
    const fileName = ctx.message.document.file_name;
    ctx.reply(`📎 File ID документа (${fileName}): ${fileId}`);
  }
});

bot.on('photo', (ctx) => {
  if (!ctx.message.reply_to_message) {
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    ctx.reply(`🖼️ File ID картинки: ${fileId}`);
  }
});

bot.command('getgroupid', (ctx) => {
  if (ctx.chat.type !== 'private') {
    const message = `
📋 Информация о группе:
ID: <code>${ctx.chat.id}</code>
Название: ${ctx.chat.title}
Тип: ${ctx.chat.type}
    `;
    return ctx.reply(message, { parse_mode: 'HTML' });
  }
});

// ==================== ЗАПУСК СЕРВЕРА ====================

app.use(bot.webhookCallback('/'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`✅ Ping URL: https://my-tutor-bot.onrender.com/ping`);
  console.log(`✅ Health check: https://my-tutor-bot.onrender.com/health`);
  
  bot.launch({
    webhook: {
      domain: 'my-tutor-bot.onrender.com',
      port: PORT
    }
  }).then(() => {
    console.log(`✅ Бот запущен в режиме вебхука`);
  }).catch(err => {
    console.error('❌ Ошибка запуска бота:', err);
  });
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
