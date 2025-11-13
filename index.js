const { Telegraf, Markup, session } = require('telegraf');

// Константы для файлов
const PHOTO_FILE_ID = 'AgACAgIAAxkBAAIK6GkUazRfErq8pL3GPs_s6f9aZvIRAAKYD2sbx7ygSLgE5jB6RB5qAQADAgADeQADNgQ';
const QUIZ_END_PHOTO_FILE_ID = 'AgACAgIAAxkBAAIMCmkV2zjemnX7Dz_CF8nt97GFFot7AAKiD2sb26CwSNbqfQM1zKo_AQADAgADeAADNgQ';

const bot = new Telegraf(process.env.BOT_TOKEN);

// Сессия для хранения состояния пользователя
bot.use(session());

// Данные квиза
const quizData = {
    questions: [
        {
            question: "Какой метод используется для создания элемента в React?",
            options: ["React.createElement()", "React.newElement()", "React.makeElement()", "document.createElement()"],
            correct: 0
        },
        {
            question: "Что такое JSX?",
            options: [
                "JavaScript XML",
                "Java Syntax Extension", 
                "JavaScript Extension",
                "Просто синтаксис"
            ],
            correct: 0
        },
        {
            question: "Как передать данные от родителя к ребенку?",
            options: [
                "Через props",
                "Через state",
                "Через context",
                "Через ref"
            ],
            correct: 0
        }
    ]
};

// Приветственное сообщение от учителя
const sendTeacherWelcome = async (ctx) => {
    await ctx.replyWithPhoto(PHOTO_FILE_ID, {
        caption: `👋 Привет, ${ctx.from.first_name}! Я твой учитель по React.\n\nДавай проверим твои знания! Готов начать квиз?`,
        reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('✅ Начать квиз', 'start_quiz')]
        ]).reply_markup
    });
};

// Начало квиза
const startQuiz = async (ctx) => {
    ctx.session.quiz = {
        currentQuestion: 0,
        score: 0,
        answers: []
    };
    
    await showQuestion(ctx);
};

// Показать вопрос
const showQuestion = async (ctx) => {
    const quiz = ctx.session.quiz;
    const questionData = quizData.questions[quiz.currentQuestion];
    
    const keyboard = Markup.inlineKeyboard(
        questionData.options.map((option, index) => 
            [Markup.button.callback(option, `answer_${index}`)]
        )
    );
    
    await ctx.reply(
        `❓ Вопрос ${quiz.currentQuestion + 1}/${quizData.questions.length}\n\n${questionData.question}`,
        keyboard
    );
};

// Проверка ответа
const checkAnswer = async (ctx, answerIndex) => {
    const quiz = ctx.session.quiz;
    const questionData = quizData.questions[quiz.currentQuestion];
    
    const isCorrect = answerIndex === questionData.correct;
    
    if (isCorrect) {
        quiz.score++;
        await ctx.reply('✅ Правильно! Молодец!');
    } else {
        await ctx.reply(`❌ Неправильно. Правильный ответ: ${questionData.options[questionData.correct]}`);
    }
    
    quiz.answers.push({
        question: questionData.question,
        userAnswer: answerIndex,
        correctAnswer: questionData.correct,
        isCorrect: isCorrect
    });
    
    quiz.currentQuestion++;
    
    // Переход к следующему вопросу или завершение квиза
    if (quiz.currentQuestion < quizData.questions.length) {
        setTimeout(() => showQuestion(ctx), 1500);
    } else {
        setTimeout(() => finishQuiz(ctx), 1500);
    }
};

// Завершение квиза
const finishQuiz = async (ctx) => {
    const quiz = ctx.session.quiz;
    const score = quiz.score;
    const total = quizData.questions.length;
    const percentage = Math.round((score / total) * 100);
    
    let message = `🎉 Квиз завершен!\n\n`;
    message += `📊 Твой результат: ${score}/${total} (${percentage}%)\n\n`;
    
    if (percentage >= 80) {
        message += `🏆 Отличный результат! Ты хорошо знаешь React!`;
    } else if (percentage >= 60) {
        message += `👍 Хороший результат! Продолжай изучать React!`;
    } else {
        message += `💪 Не расстраивайся! Повтори материал и попробуй снова!`;
    }
    
    // Отправляем новую картинку в конце квиза
    await ctx.replyWithPhoto(QUIZ_END_PHOTO_FILE_ID, {
        caption: message,
        reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('🔄 Пройти еще раз', 'start_quiz')]
        ]).reply_markup
    });
    
    // Очищаем сессию
    delete ctx.session.quiz;
};

// Обработчики команд
bot.start(sendTeacherWelcome);

bot.command('quiz', (ctx) => {
    sendTeacherWelcome(ctx);
});

// Обработчики callback-ов
bot.action('start_quiz', (ctx) => {
    ctx.deleteMessage();
    startQuiz(ctx);
});

bot.action(/answer_(\d+)/, (ctx) => {
    const answerIndex = parseInt(ctx.match[1]);
    ctx.deleteMessage();
    checkAnswer(ctx, answerIndex);
});

// Запуск бота
bot.launch().then(() => {
    console.log('Бот запущен!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
