const { Telegraf } = require('telegraf');
const http = require('http');

const BOT_TOKEN = '7099638631:AAHWoLCmXPsXa3yi-RRhw9htZj-IJEI6FjA';
const bot = new Telegraf(BOT_TOKEN);

// ==================== КОНФИГУРАЦИЯ ====================
const GROUP_ID = '-1002008510442';
const GROUP_LINK = 'https://t.me/+GFITSpvrpsQxZjcy';
const TEACHER_USERNAME = '@Irina_Burtseva_333';
const PRESENTATIONS_LINK = 'https://drive.google.com/drive/folders/1Xz5U6rU_IKscuTj3n1_xqWdITkDMVD00?usp=sharing';

const TEACHER_PHOTO_FILE_ID = 'AgACAgIAAxkBAAIMOGkWITQjSUUznGjw9L1rObMsTNM8AAJuEmsb26CwSFk5-U2vxJ6BAQADAgADeQADNgQ'; // ✅ Новая картинка для приветствия учителя
const QUIZ_END_PHOTO_FILE_ID = 'AgACAgIAAxkBAAIMIWkWEYKpBRe0YPXAWc9NTrwB7zJxAALWEWsb26CwSJRxk3uV9u6hAQADAgADeAADNgQ'; // ✅ Картинка для завершения теста
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
    correct: 1
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

// ==================== ВРЕМЕННЫЙ КОД ДЛЯ ПОЛУЧЕНИЯ FILE_ID ====================
// УДАЛИТЕ ЭТОТ БЛОК ПОСЛЕ ПОЛУЧЕНИЯ ВСЕХ FILE_ID

bot.on('video', (ctx) => {
  const fileId = ctx.message.video.file_id;
  ctx.reply(`🎬 File ID видео: ${fileId}`);
});

bot.on('document', (ctx) => {
  const fileId = ctx.message.document.file_id;
  const fileName = ctx.message.document.file_name;
  ctx.reply(`📎 File ID документа (${fileName}): ${fileId}`);
});

bot.on('photo', (ctx) => {
  const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
  ctx.reply(`🖼️ File ID картинки: ${fileId}`);
});

bot.on('animation', (ctx) => {
  const fileId = ctx.message.animation.file_id;
  ctx.reply(`🎭 File ID анимации: ${fileId}`);
});

// Команда для получения ID группы
bot.command('getgroupid', (ctx) => {
  if (ctx.chat.type !== 'private') {
    const message = `
📋 Информация о группе:
ID: <code>${ctx.chat.id}</code>
Название: ${ctx.chat.title}
Тип: ${ctx.chat.type}
    `;
    return ctx.reply(message, { parse_mode: 'HTML' });
  } else {
    return ctx.reply('Добавьте меня в группу и используйте команду /getgroupid там');
  }
});

// ==================== ФУНКЦИИ ТЕСТИРОВАНИЯ ====================

// Функция отправки вопроса с Quiz
async function sendQuizQuestion(userId, questionIndex) {
  const question = QUESTIONS[questionIndex];
  
  console.log(`📝 Отправляем вопрос ${questionIndex + 1} пользователю ${userId}`);
  
  // Сохраняем текущий вопрос для пользователя
  userProgress.set(userId, { 
    currentQuestion: questionIndex
  });
  
  try {
    // Отправляем вопрос как Quiz через bot.telegram
    await bot.telegram.sendPoll(
      userId,
      `❓ Вопрос ${questionIndex + 1}/3:\n\n${question.text}`,
      question.options,
      {
        type: 'quiz',
        correct_option_id: question.correct,
        is_anonymous: false,
        allows_multiple_answers: false
      }
    );
    
    console.log(`✅ Вопрос ${questionIndex + 1} отправлен`);
    
  } catch (error) {
    console.error('❌ Ошибка отправки вопроса:', error);
  }
}

// Функция отправки следующего вопроса
async function sendNextQuestion(userId, currentQuestionIndex, isCorrect) {
  if (isCorrect) {
    // Правильный ответ - переходим к следующему вопросу
    const nextQuestionIndex = currentQuestionIndex + 1;
    
    console.log(`✅ Правильно! Переход к вопросу ${nextQuestionIndex + 1}`);
    
    if (nextQuestionIndex < QUESTIONS.length) {
      // Сразу отправляем следующий вопрос
      await sendQuizQuestion(userId, nextQuestionIndex);
    } else {
      // Все вопросы пройдены
      console.log(`🎉 Пользователь ${userId} завершил тест`);
      await sendTestCompletion(userId);
    }
  } else {
    // Неправильный ответ - повторяем тот же вопрос
    console.log(`❌ Неправильно! Повтор вопроса ${currentQuestionIndex + 1}`);
    
    // Сразу отправляем тот же вопрос заново
    await sendQuizQuestion(userId, currentQuestionIndex);
  }
}

// Функция завершения теста
async function sendTestCompletion(userId) {
  console.log(`🏁 Отправляем завершение теста для пользователя ${userId}`);
  
  // Удаляем прогресс пользователя
  userProgress.delete(userId);
  
  // Отправляем финальное сообщение с НОВОЙ картинкой
  await bot.telegram.sendPhoto(
    userId,
    QUIZ_END_PHOTO_FILE_ID, // ✅ Используется картинка для завершения теста
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
  
  await ctx.replyWithPhoto(TEACHER_PHOTO_FILE_ID, { // ✅ Используется новая картинка для учителя
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
    caption: '🎬 А вот и первый урок! 😊\n\n<b>Урок 1:</b> <b>Как человек и компьютер воспринимают информацию</b>\n\nКогда посмотришь его, жми на кнопку "Просмотрено"',
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

// Запуск тестирования после завершения урока - БЕЗ ЗАДЕРЖКИ
bot.action('lesson_1_completed', async (ctx) => {
  ctx.answerCbQuery();
  const userId = ctx.from.id;
  
  console.log(`🎯 Начинаем тестирование для пользователя ${userId}`);
  
  // Сразу отправляем приветственное сообщение и первый вопрос
  await ctx.reply('Отлично! Проверим твою память? 😊');
  await sendQuizQuestion(userId, 0);
});

// Обработчик ответов на Quiz вопросы
bot.on('poll_answer', async (ctx) => {
  const pollAnswer = ctx.pollAnswer;
  const userId = pollAnswer.user.id;
  const optionIds = pollAnswer.option_ids;
  
  console.log(`📊 Пользователь ${userId} ответил на опрос, выбранные опции:`, optionIds);
  
  // Получаем текущий вопрос пользователя
  const userData = userProgress.get(userId);
  
  if (userData && userData.currentQuestion !== undefined) {
    const currentQuestionIndex = userData.currentQuestion;
    const question = QUESTIONS[currentQuestionIndex];
    
    // Проверяем правильность ответа
    const isCorrect = optionIds.length > 0 && optionIds[0] === question.correct;
    
    console.log(`✅ Ответ ${isCorrect ? 'правильный' : 'неправильный'} на вопрос ${currentQuestionIndex + 1}`);
    
    // Отправляем следующий вопрос или повторяем текущий
    await sendNextQuestion(userId, currentQuestionIndex, isCorrect);
  } else {
    console.log('❌ Не найдены данные пользователя для обработки ответа');
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
