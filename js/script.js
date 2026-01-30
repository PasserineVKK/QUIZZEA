// 1. VARIABLES
let topics = [];
let score = 0;
let questionNo = 0;
let topicId = 0;
let currentQuiz = null;
let isAnswer = false;
let userResults = []; 
let timerInterval = null;
let timeLeft = 0;

// Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
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


let DB_URL = 'db/db.json'
// 2. FETCH DATA
fetch(DB_URL)
    .then(res => res.json())
    .then(data => {
        topics = data.topics;
        displayTopics(topics);
    });

function displayTopics(topics) {
    let selectionList = '<option value="0">-----Choose one topic-----</option>';
    topics.forEach(topic => {
        selectionList += `<option value="${topic.id}">${topic.name}</option>`;
    });
    topicSelection.innerHTML = selectionList;
}

// 3. LOGIC QUIZ
function renderQuestion(topic) {
    if (!topic) return;
    const questions = topic.questions;
    currentQuiz = questions[questionNo];

    if (currentQuiz) {
        quizTopic.textContent = "TOPIC: " + topic.name;
        currentQuestionCounter.textContent = questionNo + 1;
        questionText.textContent = currentQuiz.question;

        optionBtns.forEach(btn => {
            const label = btn.getAttribute('ans');
            btn.querySelector('.option-text').textContent = currentQuiz.options[label];
            btn.classList.remove('correct', 'wrong'); 
        });
    } else {
        clearInterval(timerInterval);
        showScreen(resultScreen);
        renderResult();
    }
}

function renderResult() {
    saveToLocal();
    const finalScore = document.getElementById('final-score');
    const reviewContainer = document.getElementById('review-container');
    if (finalScore) finalScore.textContent = score;

    // Lấy lịch sử 3 lượt từ LocalStorage
    const history = JSON.parse(localStorage.getItem('quiz_history')) || [];
    
    let historyHTML = `<h3>Lịch sử 3 lượt gần nhất (Nhấn để xem):</h3>`;
    history.forEach((entry, index) => {
        historyHTML += `
            <div class="history-item" style="margin-bottom: 10px; border: 1px solid #ddd;">
                <button onclick="toggleHistory(${index})" style="width:100%; padding:10px; text-align:left; background:#f4f4f4; border:none; cursor:pointer;">
                    <strong>${entry.topicName}</strong> - ${entry.score} điểm (${entry.date}) ▾
                </button>
                <div id="hist-content-${index}" style="display:none; padding:10px;">
                    ${generateReviewHTML(entry.results)}
                </div>
            </div>
        `;
    });
    reviewContainer.innerHTML = historyHTML;
}

function generateReviewHTML(results) {
    return results.map((item, idx) => `
        <div style="margin-bottom:10px; border-bottom:1px dashed #ccc;">
            <p><strong>Câu ${idx + 1}:</strong> ${escapeHTML(item.question)}</p>
            <p style="color:${item.isCorrect ? 'green' : 'red'}">Bạn chọn: ${escapeHTML(item.userAnswerText)}</p>
            ${!item.isCorrect ? `<p style="color:green">Đáp án đúng: ${escapeHTML(item.correctAnswerText)}</p>` : ''}
        </div>
    `).join('');
}

function startTimer(durationInMinutes) {
    clearInterval(timerInterval);
    timeLeft = durationInMinutes * 60;
    let timerDisplay = document.getElementById('timer-display');
    if (!timerDisplay) {
        timerDisplay = document.createElement('div');
        timerDisplay.id = 'timer-display';
        timerDisplay.style = "font-weight: bold; color: red; margin: 10px 0;";
        quizScreen.insertBefore(timerDisplay, quizTopic);
    }

    timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        // Định dạng hiển thị MM:SS
        timerDisplay.textContent = `Thời gian còn lại: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = "HẾT GIỜ!";
            alert("Đã hết thời gian làm bài!");
            showScreen(resultScreen);
            renderResult();
        }
        timeLeft--;
    }, 1000);
}

window.toggleHistory = (index) => {
    const el = document.getElementById(`hist-content-${index}`);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

function saveToLocal() {
    let history = JSON.parse(localStorage.getItem('quiz_history')) || [];
    const currentTopic = topics.find(t => t.id == topicId);
    
    const newEntry = {
        topicName: currentTopic ? currentTopic.name : "Unknown",
        score: `${score}/${userResults.length}`,
        date: new Date().toLocaleString(),
        results: userResults
    };

    history.unshift(newEntry);
    localStorage.setItem('quiz_history', JSON.stringify(history.slice(0, 3)));
}

// 4. EVENT LISTENERS
startBtn.addEventListener('click', () => {
    topicId = topicSelection.value;
    const selectedTopic = topics.find(t => t.id == topicId);
    if (selectedTopic) {
        score = 0;
        questionNo = 0;
        userResults = []; 
        showScreen(quizScreen);
        renderQuestion(selectedTopic);
        const quizTime = selectedTopic.time || 5;
        startTimer(quizTime);
    }
});

optionBtns.forEach(button => {
    button.addEventListener('click', () => {
        const currentChoice = button.getAttribute('ans');
        const isCorrect = currentChoice === currentQuiz.correct_answer;
        
        if (isCorrect) score++;
        feedbackText.textContent = isCorrect ? 'Good answer!' : currentQuiz.explanation;

        userResults.push({
            question: currentQuiz.question,
            userAnswerText: currentQuiz.options[currentChoice],
            correctAnswerText: currentQuiz.options[currentQuiz.correct_answer],
            isCorrect: isCorrect,
            explanation: currentQuiz.explanation
        });

        isAnswer = true;
        optionBtnsDisable(true);
    });
});

nextBtn.addEventListener('click', () => {
    if (!isAnswer) {
        remainder.textContent = 'You have not finished this quiz!';
    } else {
        remainder.textContent = '';
        feedbackText.textContent = '';
        questionNo++;
        isAnswer = false;
        optionBtnsDisable(false);
        const selectedTopic = topics.find(t => t.id == topicId);
        renderQuestion(selectedTopic); 
    }
});

restartBtn.addEventListener('click', () => {
    showScreen(startScreen);
});

function showScreen(screen) {
    [startScreen, quizScreen, resultScreen].forEach(s =>{
         s.classList.add('hidden');
        s.classList.remove('active')
        });
    screen.classList.remove('hidden');
}

function optionBtnsDisable(status) {
    optionBtns.forEach(btn => btn.disabled = status);
}

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"}[m]));
}