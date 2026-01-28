// 1. KHAI BÁO BIẾN TOÀN CỤC (Global Variables)
let topics = [];
let score = 0;
let questionNo = 0;
let topicId = 0;
let currentQuiz = null;
let isAnswer = false;

// Element màn hình
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

// Element điều khiển & hiển thị
const topicSelection = document.getElementById('topic-selection');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const optionBtns = document.querySelectorAll('.option-btn');

const quizTopic = document.getElementById('quiz-topic');
const questionText = document.getElementById('question-text');
const currentQuestionCounter = document.getElementById('current-ques');
const feedbackText = document.getElementById('feedback');
const remainder = document.querySelector('.remainder');

const DB_URL = 'db/db.json';

// 2. KẾT NỐI DỮ LIỆU (Fetch Data)
fetch(DB_URL)
    .then(response => {
        if (!response.ok) throw new Error('Fetch ERROR');
        return response.json();
    })
    .then(data => {
        topics = data.topics;
        displayTopics(topics);
    })
    .catch(error => console.error(error));

// 3. CÁC HÀM HỖ TRỢ (Helper Functions)
function displayTopics(topics) {
    let selectionList = '<option value="0">-----Choose one topic-----</option>';
    topics.forEach(topic => {
        selectionList += `<option value="${topic.id}">${topic.name}</option>`;
    });
    topicSelection.innerHTML = selectionList;
}

function renderQuestion(topic) {
    const questions = topic.questions;
    currentQuiz = questions[questionNo];

    if (currentQuiz) {
        // Cập nhật giao diện câu hỏi
        quizTopic.textContent = "TOPIC: " + topic.name;
        currentQuestionCounter.textContent = questionNo + 1; // Thường bắt đầu từ 1 cho user dễ nhìn
        questionText.textContent = currentQuiz.question;

        optionBtns.forEach(btn => {
            const label = btn.querySelector('.option-label').textContent;
            const optionText = btn.querySelector('.option-text');
            optionText.textContent = currentQuiz.options[label];
        });
    } else {
        // Khi hết câu hỏi
        showScreen(resultScreen);
        renderResult();
    }
}

function optionBtnsDisable(status) {
    optionBtns.forEach(btn => btn.disabled = status);
}

function renderResult() {
    const finalScore = document.getElementById('final-score');
    if (finalScore) finalScore.textContent = score;
}

// Hàm bổ trợ để chuyển màn hình an toàn
function showScreen(targetScreen) {
    [startScreen, quizScreen, resultScreen].forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });
    targetScreen.classList.remove('hidden');
    targetScreen.classList.add('active');
}

// 4. GÁN SỰ KIỆN (Event Listeners)

// Nút Bắt đầu
startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    topicId = topicSelection.value;
    if (topicId !== "0") {
        score = 0;
        questionNo = 0;
        feedbackText.textContent = '';
        showScreen(quizScreen);
        renderQuestion(topics[topicId - 1]);
    }
});

// Các nút chọn đáp án
optionBtns.forEach(button => {
    button.addEventListener('click', () => {
        const currentChoice = button.getAttribute('ans');
        
        if (currentChoice === currentQuiz.correct_answer) {
            feedbackText.textContent = 'Good answer!';
            score++;
        } else {
            feedbackText.textContent = currentQuiz.explanation;
        }
        
        isAnswer = true;
        optionBtnsDisable(true);
    });
});

// Nút câu tiếp theo
nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isAnswer) {
        remainder.textContent = 'You have not finished this quiz!';
    } else {
        remainder.textContent = '';
        feedbackText.textContent = '';
        questionNo++;
        isAnswer = false;
        optionBtnsDisable(false);
        renderQuestion(topics[topicId - 1]);
    }
});

// Nút chơi lại
restartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    topicId = 0;
    isAnswer = false;
    optionBtnsDisable(false);
    showScreen(startScreen);
});