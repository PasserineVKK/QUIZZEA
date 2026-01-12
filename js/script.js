var currentQuiz = {
    id: 0,
    question: '',
    options: {},
    correct_answer: '',
    explanation: ''
}
var startScreen = document.getElementById('start-screen');
var quizScreen = document.getElementById('quiz-screen');

// ================FETCH CSDL==================

const DB_URL = '../db/db.json';
var data = fetch(DB_URL)
.then(function(response){
    if (!response.ok) throw new Error('Fetch ERROR');
    return response.json();
})
.then(function(data){
    const topics = data.topics;
    console.log(topics);
    displayTopics(topics);
    
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
var topicId;
var startBtn = document.getElementById('start-btn');
topicSelection.addEventListener('change',(e)=>{
    e.stopPropagation();
    topicId = topicSelection.value;
});

startBtn.addEventListener('click',(e)=>{
    e.stopPropagation();
    if (topicId !== 0){
        startScreen.classList.replace('active', 'hidden');
        quizScreen.classList.replace('hidden', 'active');
    };
});

var questionNo = 0;
function renderQuestion(topic){
    var questions = topic.questions;
    currentQuiz = questions[questionNo];
    console.log(currentQuiz);
}
//can lam render topic dung chu de select
