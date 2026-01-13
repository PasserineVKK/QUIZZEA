var currentQuiz = {
    id: 0,
    question: '',
    options: {},
    correct_answer: '',
    explanation: ''
}
let topics = [];
var startScreen = document.getElementById('start-screen');
var quizScreen = document.getElementById('quiz-screen');
var topicId = 1;
// ================FETCH CSDL==================

const DB_URL = '../db/db.json';
var data = fetch(DB_URL)
.then(function(response){
    if (!response.ok) throw new Error('Fetch ERROR');
    return response.json();
})
.then(function(data){
    topics = data.topics;
    console.log(topics);
    displayTopics(topics);
    console.log(topicId);


    
})
.catch(error =>{
    console.log(error);
})


// ============================TOPIC HANDLE
var topicSelection = document.getElementById('topic-selection');
function displayTopics(topics){
    var selectionList = '<option value="0">-----Choose one topic-----</option>'
    topics.forEach(topic =>{
        selectionList += `<option value="${topic.id}">${topic.name}</option>`
    });
    topicSelection.innerHTML = selectionList;
}

var startBtn = document.getElementById('start-btn');



startBtn.addEventListener('click',(e)=>{
    e.stopPropagation();
    if (topicId !== 0){
        startScreen.classList.replace('active', 'hidden');
        quizScreen.classList.replace('hidden', 'active');
        renderQuestion(topics[topicId-1]);
    };
});

var quizTopic = document.getElementById('quiz-topic');
var questionText = document.getElementById('question-text');
var currentQuestionCounter = document.getElementById('current-ques');
var optionBtns = document.querySelectorAll('.option-btn');


var questionNo = 0;
function renderQuestion(topic){
    console.log(topic);
    var topicName = topic.name;
    quizTopic.textContent = "TOPIC: "+topicName;

    var questions = topic.questions;
    currentQuiz = questions[questionNo];

    currentQuestionCounter.textContent = questionNo;
    questionText.textContent = currentQuiz.question;
    console.log(currentQuiz);

    optionBtns.forEach(btn => {
        const label = btn.querySelector('.option-label').textContent;
        const optionText = btn.querySelector('.option-text');
        optionText.textContent = currentQuiz.options[label];
    })
    
}
//can lam render topic dung chu de select
