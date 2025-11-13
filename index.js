const { Telegraf } = require('telegraf');
const http = require('http');

const BOT_TOKEN = '7099638631:AAHWoLCmXPsXa3yi-RRhw9htZj-IJEI6FjA';
const bot = new Telegraf(BOT_TOKEN);

// ==================== КОНФИГУРАЦИЯ ====================
const GROUP_ID = '-1002008510442';
const GROUP_LINK = 'https://t.me/+GFITSpvrpsQxZjcy';
const TEACHER_USERNAME = '@Irina_Burtseva_333';
const PRESENTATIONS_LINK = 'https://drive.google.com/drive/folders/1Xz5U6rU_IKscuTj3n1_xqWdITkDMVD00?usp=sharing';

const PHOTO_FILE_ID = 'AgACAgIAAxkBAAIK6GkUazRfErq8pL3GPs_s6f9aZvIRAAKYD2sbx7ygSLgE5jB6RB5qAQADAgADeQADNgQ';
const LESSON_1_VIDEO_ID = 'BAACAgIAAxkBAAILEmkUcZ8uZ_OqxCOvMLHMxscHMT1hAALWhAACx7yoSAABJZ0DfMLJwzYE';
const LESSON_1_PRESENTATION_ID = 'BQACAgIAAxkBAAILEGkUcXSoiRSVlLTghiLfcgpaOZXrAALThAACx7yoSCH7jmZckm_FNgQ';
const KEYBOARD_IMAGE_ID = 'AgACAgIAAxkBAAILAAFpFG_ClIIPp47f5Q7gVQgCXI6IOgACFgtrG8e8qEh2VPMhVfW90gEAAwIAA3gAAzYE';

// ==================== ВОПРОСЫ ДЛЯ ТЕСТИРОВАНИЯ ====================
const QUESTIONS = [
  {
    id: 1,
    text: "Как человек воспринимает информацию?",
    options: [
      "С помощью телевизора и компьютера",
      "С помощью органов чувств: зрения, обоняния, осязания, вкуса и слуха",
      "Через книжки и журналы"
    ],
    correct: 1 // Индекс правильного ответа (начинается с 0)
  },
  {
    id: 2,
    text: "Как компьютер воспринимает информацию?",
    options: [
      "С помощью клавиатуры, мышки, микрофона и веб камеры",
      "Ищет сам на разных сайтах в интернете",
      "Сканирует документы и картинки, которые человек помещает в него"
    ],
    correct: 0
  },
  {
    id: 3,
    text: "Как называется мозг компьютера?",
    options: [
      "Жесткий диск",
      "Монитор", 
      "Процессор"
    ],
    correct: 2
  }
];

// Хранилище прогресса пользователей
const userProgress = new Map();

// ==================== HTTP СЕРВЕР ДЛЯ CRON-JOB ====================
const server = http.createServer((req, res) => {
  console.log('📨 Получен запрос:', req.method, req.url);
  
  if (req.method === 'GET') {
    res.writeHead(200, { 
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    });
    res.end('OK - Bot is alive');
    return;
  }
  
  if (req.method === 'POST' && req.url === '/') {
    bot.webhookCallback('/')(req, res);
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

// ==================== ФУНКЦИИ ТЕСТИРОВАНИЯ ====================

// Функция отправки вопроса с Quiz (кружочками)
async function sendQuizQuestion(ctx, questionIndex) {
  const question = QUESTIONS[questionIndex];
  const userId = ctx.from.id;
  
  // Сохраняем текущий вопрос для пользователя
  if (!userProgress.has(userId)) {
    userProgress.set(userId, { currentQuestion: questionIndex });
  } else {
    userProgress.get(userId).currentQuestion = questionIndex;
  }
  
  // Отправляем вопрос как Quiz (с кружочками)
  const message = await ctx.replyWithPoll(
    `❓ Вопрос ${questionIndex + 1}/3:\n\n${question.text}`,
    question.options,
    {
      type: 'quiz',
      correct_option_id: question.correct,
      is_anonymous: false
    }
  );
  
  // Сохраняем ID сообщения с вопросом
  if (userProgress.has(userId)) {
    userProgress.get(userId).questionMessageId = message.message_id;
  }
}

// Функция обработки ответа на Quiz
async function handleQuizAnswer(ctx, questionIndex) {
  const userId = ctx.from.id;
  
  // Ждем немного перед следующим вопросом
  setTimeout(async () => {
    if (questionIndex < QUESTIONS.length - 1) {
      // Следующий вопрос
      await sendQuizQuestion(ctx, questionIndex + 1);
    } else {
      // Все вопросы пройдены
      await sendTestCompletion(ctx);
    }
  }, 2000);
}

// Функция завершения теста
async function sendTestCompletion(ctx) {
  // Удаляем прогресс пользователя
  userProgress.delete(ctx.from.id);
  
  // Отправляем финальное сообщение с картинкой
  await ctx.replyWithPhoto(
    PHOTO_FILE_ID,
    {
      caption: '🎊 Прекрасно! Ты молодец! Погнали дальше? 😊',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Следующий урок', callback_data: 'next_lesson_after_test' }]
        ]
      }
    }
  );
}

// ==================== ОСНОВНЫЕ ОБРАБОТЧИКИ ====================

// Главный обработчик start
bot.start((ctx) => {
  console.log('✅ /start от:', ctx.from.first_name);
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

// Проверка готовности
bot.action('check_ready', (ctx) => {
  ctx.answerCbQuery();
  return ctx.editMessageText(
    '🚀 Для старта курса проверьте что:\n1. Программа телеграмм установлена на вашем компьютере.\n\n👉 Если вы еще не установили программу телеграмм на компьютер, то установите её самостоятельно или посмотрите видео-инструкцию по установке русской версии телеграмм на компьютер.\n\n✅ После выполнения условий нажмите кнопку "Продолжить"',
    {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Инструкция', url: 'https://rutube.ru/video/1ee124b1c2b20ca0c471d8e249f4126d/' }],
          [{ text: 'Продолжить', callback_data: 'continue_course' }]
        ]
      }
    }
  );
});

// Проверка подписки
bot.action('continue_course', async (ctx) => {
  ctx.answerCbQuery();
  const userId = ctx.from.id;
  
  try {
    const chatMember = await ctx.telegram.getChatMember(GROUP_ID, userId);
    const isSubscribed = ['member', 'administrator', 'creator'].includes(chatMember.status);
    
    if (isSubscribed) {
      return ctx.editMessageText('✅ Отлично! Успешной учебы', {
        reply_markup: { inline_keyboard: [[{ text: 'Далее', callback_data: 'next_step' }]] }
      });
    } else {
      return ctx.editMessageText(
        '❌ К сожалению мы не нашли вашу подписку на группу курса.\n\nПожалуйста проверьте вашу почту и подпишитесь на группу.\n\nНапишите нам @Irina_Burtseva_333',
        { parse_mode: 'HTML', disable_web_page_preview: true }
      );
    }
  } catch (error) {
    console.error('Ошибка проверки подписки:', error);
    return ctx.editMessageText('Произошла ошибка. Попробуйте позже.');
  }
});

// Приветствие учителя
bot.action('next_step', async (ctx) => {
  ctx.answerCbQuery();
  
  await ctx.replyWithPhoto(PHOTO_FILE_ID, {
    caption: 'Привет! Меня зовут Ирина Бурцева, я твой учитель! Мы будем изучать как устроен компьютер и что в нем можно делать.',
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Написать в группу для вопросов', url: GROUP_LINK }],
        [{ text: 'Написать учителю лично', url: `https://t.me/${TEACHER_USERNAME.replace('@', '')}` }]
      ]
    }
  });
  
  await ctx.reply(
    'Вы можете скачать презентации к каждому уроку или смотреть их в режиме онлайн тут (требуется гугл аккаунт):',
    {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[{ text: 'Все презентации к урокам', url: PRESENTATIONS_LINK }]]
      }
    }
  );
  
  await ctx.reply('Чтобы открыть урок жми на кнопку Урок 1 👇', {
    reply_markup: { inline_keyboard: [[{ text: 'Урок 1', callback_data: 'lesson_1' }]] }
  });
});

// Урок 1
bot.action('lesson_1', async (ctx) => {
  ctx.answerCbQuery();
  await ctx.replyWithVideo(LESSON_1_VIDEO_ID, {
    caption: '🎬 А вот и первый урок! 😊\n\n<b>Тема:</b> <b>Как человек и компьютер воспринимают информацию</b>\n\nКогда посмотришь его, жми на кнопку "Просмотрено"',
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: [[{ text: '✅ Просмотрено', callback_data: 'lesson_1_watched' }]] }
  });
});

bot.action('lesson_1_watched', async (ctx) => {
  ctx.answerCbQuery();
  await ctx.replyWithDocument(LESSON_1_PRESENTATION_ID, {
    caption: '📎 <b>Презентация к уроку 1</b>', parse_mode: 'HTML'
  });
  
  await ctx.replyWithPhoto(KEYBOARD_IMAGE_ID, {
    caption: '⌨️ <b>Дополнительный файл к уроку 1</b>\nГде какие кнопки?', parse_mode: 'HTML'
  });
  
  await ctx.reply('Когда всё посмотришь и выполнишь задания, жми на кнопку "Просмотрено" 👇', {
    reply_markup: { inline_keyboard: [[{ text: '✅ Всё просмотрено, иду дальше', callback_data: 'lesson_1_completed' }]] }
  });
});

// Запуск тестирования после завершения урока
bot.action('lesson_1_completed', async (ctx) => {
  ctx.answerCbQuery();
  
  // Отправляем приветственное сообщение перед тестом
  await ctx.reply('Отлично! Проверим твою память? 😊');
  
  // Ждем немного и начинаем тестирование с первого вопроса
  setTimeout(async () => {
    await sendQuizQuestion(ctx, 0);
  }, 1500);
});

// Обработчик ответов на Quiz вопросы
bot.on('poll_answer', async (ctx) => {
  const pollAnswer = ctx.pollAnswer;
  const userId = ctx.pollAnswer.user.id;
  
  // Получаем текущий вопрос пользователя
  const userData = userProgress.get(userId);
  if (userData && userData.currentQuestion !== undefined) {
    const questionIndex = userData.currentQuestion;
    
    // Обрабатываем ответ
    await handleQuizAnswer(ctx, questionIndex);
  }
});

// Обработчик перехода к следующему уроку после теста
bot.action('next_lesson_after_test', (ctx) => {
  ctx.answerCbQuery();
  return ctx.reply('🎉 Поздравляю с завершением Урока 1!\n\nСледующий урок будет доступен скоро...', {
    reply_markup: { inline_keyboard: [[{ text: 'Урок 2', callback_data: 'lesson_2' }]] }
  });
});

// Текстовые сообщения
bot.on('text', (ctx) => {
  if (!ctx.message.text.startsWith('/')) {
    return ctx.reply('Используйте команду /start для начала работы');
  }
});

// ==================== ЗАПУСК ====================

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`✅ Cron-job.org может пинговать любой URL`);
  
  bot.launch().then(() => {
    console.log('✅ Бот запущен в режиме polling');
  }).catch(err => {
    console.error('❌ Ошибка запуска бота:', err);
  });
});

process.once('SIGINT', () => {
  console.log('🛑 Остановка...');
  bot.stop('SIGINT');
  server.close();
});
process.once('SIGTERM', () => {
  console.log('🛑 Остановка...');
  bot.stop('SIGTERM');
  server.close();
});
