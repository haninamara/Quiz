const quizData = {
    beginner: [
        { question: "Quelle balise HTML est utilisée pour créer un lien hypertexte ?", answers: ["<link>", "<a>", "<href>"], correctAnswer: "<a>", type: "qcm" },
        { question: "Le CSS est utilisé pour la structure d'une page web (Vrai/Faux) ?", answers: ["Vrai", "Faux"], correctAnswer: "Faux", type: "boolean" },
        { question: "Quel événement JavaScript est déclenché lors d'un clic ?", answers: ["onclick", "onhover", "onload"], correctAnswer: "onclick", type: "qcm" },
        { question: "Quelle balise HTML crée un paragraphe ?", answers: ["<p>", "<paragraph>", "<text>"], correctAnswer: "<p>", type: "qcm" },
        { question: "La propriété CSS `color` modifie la couleur de fond (Vrai/Faux) ?", answers: ["Vrai", "Faux"], correctAnswer: "Faux", type: "boolean" },
        { question: "Comment déclarer une variable en JavaScript moderne ?", answers: ["variable x = 5", "let x = 5", "var x := 5"], correctAnswer: "let x = 5", type: "qcm" },
        { question: "Quelle propriété CSS contrôle la taille du texte ?", answers: ["font-size", "text-size", "size"], correctAnswer: "font-size", type: "qcm" },
        { question: "La balise `<ul>` crée une liste ordonnée (Vrai/Faux) ?", answers: ["Vrai", "Faux"], correctAnswer: "Faux", type: "boolean" }
    ],
    intermediate: [
        { question: "Quel mot-clé déclare une variable constante en JavaScript ?", answers: ["var", "let", "const"], correctAnswer: "const", type: "qcm" },
        { question: "En Flexbox, `align-items` centre sur l'axe secondaire (Vrai/Faux) ?", answers: ["Vrai", "Faux"], correctAnswer: "Vrai", type: "boolean" },
        { question: "Quelle méthode JavaScript ajoute un élément à la fin d'un tableau ?", answers: ["push()", "add()", "append()"], correctAnswer: "push()", type: "qcm" },
        { question: "Quel attribut HTML rend un champ obligatoire ?", answers: ["must", "required", "mandatory"], correctAnswer: "required", type: "qcm" },
        { question: "Quelle est la fonction principale du sélecteur '::before' en CSS ?", answers: ["Ajouter une classe à un élément", "Insérer du contenu avant un élément", "Déplacer un élément au début"], correctAnswer: "Insérer du contenu avant un élément", type: "qcm" },
        { question: "La portée (`scope`) des variables déclarées avec `var` est de type bloc (Vrai/Faux) ?", answers: ["Vrai", "Faux"], correctAnswer: "Faux", type: "boolean" },
        { question: "Comment sélectionner un élément par ID en JavaScript ?", answers: ["document.querySelector('#id')", "document.getElement('id')", "document.selectId('id')"], correctAnswer: "document.querySelector('#id')", type: "qcm" },
        { question: "Quelle propriété CSS crée un dégradé linéaire ?", answers: ["background-gradient", "linear-gradient()", "gradient"], correctAnswer: "linear-gradient()", type: "qcm" }
    ],
    advanced: [
        { question: "La principale différence entre '==' et '===' est la vérification du type (Vrai/Faux) ?", answers: ["Vrai", "Faux"], correctAnswer: "Vrai", type: "boolean" },
        { question: "Quel est le rôle de 'event.preventDefault()' ?", answers: ["Annule le comportement par défaut", "Arrête la propagation", "Supprime l'événement"], correctAnswer: "Annule le comportement par défaut", type: "qcm" },
        { question: "En CSS Grid, 'grid-template-areas' définit des zones nommées (Vrai/Faux) ?", answers: ["Vrai", "Faux"], correctAnswer: "Vrai", type: "boolean" },
        { question: "Qu'est-ce qu'une closure en JavaScript ?", answers: ["Une fonction qui accède à son scope externe", "Une boucle fermée", "Un objet immuable"], correctAnswer: "Une fonction qui accède à son scope externe", type: "qcm" },
        { question: "Que retourne 'Promise.all()' si une promesse échoue ?", answers: ["Rejette immédiatement", "Attend toutes les promesses", "Retourne un tableau vide"], correctAnswer: "Rejette immédiatement", type: "qcm" },
        { question: "Le 'hoisting' déplace l'initialisation des variables au début du scope (Vrai/Faux) ?", answers: ["Vrai", "Faux"], correctAnswer: "Faux", type: "boolean" },
        { question: "Quel sélecteur CSS cible le premier enfant d'un type spécifique ?", answers: [":first-of-type", ":first-child", ":nth-child(1)"], correctAnswer: ":first-of-type", type: "qcm" },
        { question: "Quelle propriété CSS crée un contexte de empilement (stacking context) ?", answers: ["z-index avec position", "stack-order", "layer"], correctAnswer: "z-index avec position", type: "qcm" }
    ]
};

// --- Variables Globales ---
let currentLevel = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let totalScore = 0;
let answerSelected = false;
let timerInterval;
let timeLeft;

// --- Constantes de notation ---
const BASE_POINTS = 10;
const TIME_BONUS_PER_SECOND = 1;

// --- Références DOM ---
const $ = id => document.getElementById(id);

const introScreen = $('intro-screen');
const rulesScreen = $('rules-screen'); 
const startQuizBtn = $('start-quiz-btn'); 
const quizScreen = $('quiz-screen');
const resultsScreen = $('results-screen');
const questionText = $('question-text');
const answerButtonsContainer = $('answer-buttons');
const nextBtn = $('next-btn');
const restartBtn = $('restart-btn');
const progressBar = $('progress-bar');
const progressText = $('progress-text');
const finalScore = $('final-score');
const totalQuestionsSpan = $('total-questions');
const resultMessage = $('result-message');
const feedbackOverlay = $('feedback-overlay');
const currentScoreDisplay = $('current-score');
const timerDisplay = $('timer');

// Récupération des meilleurs scores
let highScores = JSON.parse(localStorage.getItem("highScores")) || {
    beginner: 0,
    intermediate: 0,
    advanced: 0
};

// --- Fonctions de Démarrage et Affichage ---

function updateBestScoresOnHome() {
    document.querySelector('.level-card.beginner .best-score').textContent = `🏆 Record : ${highScores.beginner} pts`;
    document.querySelector('.level-card.intermediate .best-score').textContent = `🏆 Record : ${highScores.intermediate} pts`;
    document.querySelector('.level-card.advanced .best-score').textContent = `🏆 Record : ${highScores.advanced} pts`;
}

function getInitialTime() {
    switch (currentLevel) {
        case "beginner": return 15;
        case "intermediate": return 12;
        case "advanced": return 8;
        default: return 10;
    }
}

function showRules() {
    // Affiche le modal de règles après la sélection du niveau
    introScreen.classList.remove("active");
    rulesScreen.classList.add("active");
}

function startQuiz() {
    currentQuestions = quizData[currentLevel];
    currentQuestionIndex = 0;
    totalScore = 0;
    answerSelected = false;
    currentScoreDisplay.textContent = `Score : 0`;

    // Transition des règles au quiz
    rulesScreen.classList.remove("active");
    quizScreen.classList.add("active");

    displayQuestion();
}

function displayQuestion() {
    answerSelected = false;
    timeLeft = getInitialTime();

    if (currentQuestionIndex >= currentQuestions.length) {
        // Cette vérification est cruciale pour éviter d'afficher une question inexistante
        showResults();
        return;
    }

    const q = currentQuestions[currentQuestionIndex];

    // Mise à jour de l'UI
    questionText.textContent = q.question;
    answerButtonsContainer.innerHTML = '';
    nextBtn.classList.add('hidden');
    nextBtn.disabled = true;

    startTimer();
    updateProgressBar();

    // Création des boutons de réponse (gère QCM et Vrai/Faux)
    q.answers.forEach(a => {
        const btn = document.createElement('button');
        btn.classList.add("btn-answer");
        // Retire la modification de style inline pour que le CSS gère la largeur de manière uniforme
        if (q.type === 'boolean') {
            btn.classList.add('btn-boolean'); 
        }
        btn.textContent = a;
        btn.onclick = () => checkAnswer(btn, q.correctAnswer);
        answerButtonsContainer.appendChild(btn);
    });
}

function updateProgressBar() {
    const total = currentQuestions.length;
    // On utilise currentQuestionIndex + 1 pour l'affichage, sauf si le quiz est fini
    const currentStep = currentQuestionIndex < total ? currentQuestionIndex + 1 : total; 
    const progress = (currentQuestionIndex / total) * 100;
    progressBar.style.width = progress + '%';
    progressText.textContent = `Question ${currentStep} / ${total}`;
}

// --- Logique du Chronomètre et du Score ---

function startTimer() {
    clearInterval(timerInterval);
    timerDisplay.textContent = `⏳ ${timeLeft} s`;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `⏳ ${timeLeft} s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeout();
        }
    }, 1000);
}

function timeout() {
    if (answerSelected) return;
    answerSelected = true;

    Array.from(answerButtonsContainer.children).forEach(btn => {
        btn.disabled = true;
        const correct = currentQuestions[currentQuestionIndex].correctAnswer;
        if (btn.textContent === correct) {
            btn.classList.add("correct");
        }
    });

    showFeedbackOverlay('⏳ Temps écoulé. 0 pt', 'wrong'); 
    
    nextBtn.classList.remove("hidden");
    nextBtn.disabled = false;
}

function checkAnswer(selectedButton, correctAnswer) {
    clearInterval(timerInterval);

    if (answerSelected) return;
    answerSelected = true;

    const isCorrect = selectedButton.textContent === correctAnswer;
    let pointsGagnes = 0;

    if (isCorrect) {
        // Calcul du score avec BONIFICATION TEMPORELLE
        const bonus = timeLeft * TIME_BONUS_PER_SECOND;
        pointsGagnes = BASE_POINTS + bonus;
        totalScore += pointsGagnes;
        
        selectedButton.classList.add('correct');
        createConfetti(selectedButton);
        showFeedbackOverlay(`+${pointsGagnes} pts! 🎉`, 'correct');
    } else {
        // Réponse fausse = 0 point gagné
        pointsGagnes = 0; 
        selectedButton.classList.add('wrong');
        showFeedbackOverlay('💭 0 pt', 'wrong');
    }

    // Afficher la bonne réponse pour le feedback visuel
    Array.from(answerButtonsContainer.children).forEach(button => {
        button.disabled = true;
        if (button.textContent === correctAnswer && !isCorrect) {
            button.classList.add('correct');
        }
    });
    
    currentScoreDisplay.textContent = `Score : ${totalScore}`;
    nextBtn.classList.remove('hidden');
    nextBtn.disabled = false;
}

function nextQuestion() {
    // Vérifie si c'est la dernière question. Si oui, on passe directement aux résultats sans transition.
    if (currentQuestionIndex === currentQuestions.length - 1) {
        currentQuestionIndex++;
        showResults();
        return;
    }

    quizScreen.classList.remove('active');
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
        quizScreen.classList.add('active');
    }, 300); 
}

// --- Logique du Résultat et de la Sauvegarde ---

function showResults() {
    // 1. Cacher l'écran du quiz
    quizScreen.classList.remove('active'); 
    // 2. Afficher l'écran des résultats
    resultsScreen.classList.add('active'); 
    
    finalScore.textContent = totalScore;

    const maxScorePerQuestion = BASE_POINTS + getInitialTime() * TIME_BONUS_PER_SECOND;
    const maxScoreTotal = currentQuestions.length * maxScorePerQuestion;
    const percentage = (totalScore / maxScoreTotal) * 100;

    let message = '';
    
    if (percentage >= 90) {
        message = "🌟 Parfait ! Score impeccable et rapidité d'exécution !";
    } else if (percentage >= 70) {
        message = "💪 Excellent travail ! Vous maîtrisez le sujet !";
    } else if (percentage >= 40) {
        message = "👍 Bien joué ! Continuez à pratiquer pour améliorer votre rapidité.";
    } else {
        message = "💡 Bon début ! Revisitez les concepts de base.";
    }
    
    resultMessage.textContent = message;

    if (totalScore > highScores[currentLevel]) {
        highScores[currentLevel] = totalScore;
        localStorage.setItem("highScores", JSON.stringify(highScores));
        resultMessage.textContent += "\n🔥 Nouveau record !!";
    } else {
        resultMessage.textContent += `\n🏆 Meilleur score ${currentLevel} : ${highScores[currentLevel]} pts`;
    }
    updateBestScoresOnHome();
}

// --- Fonctions d'Effets Visuels (Confetti/Overlay) ---

function createConfetti(button) {
    const rect = button.getBoundingClientRect();
    const colors = ['#55efc4', '#81ecec', '#74b9ff', '#a29bfe', '#ffeaa7'];
    
    for (let i = 0; i < 15; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = (rect.left + rect.width / 2) + 'px';
        confetti.style.top = rect.top + 'px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.animationDelay = `${Math.random() * 0.2}s`;
        confetti.style.animationDuration = `${0.8 + Math.random() * 0.4}s`;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 1500);
    }
}

function showFeedbackOverlay(text, type) {
    const content = feedbackOverlay.querySelector('.feedback-content');
    content.innerHTML = text; 
    feedbackOverlay.classList.remove('hidden', 'correct', 'wrong', 'show');
    feedbackOverlay.classList.add(type, 'show');

    setTimeout(() => {
        feedbackOverlay.classList.remove('show', type);
        feedbackOverlay.classList.add('hidden');
    }, 1200);
}

// --- Écouteurs d'Événements ---

// 1. Sélection du niveau -> Affiche les règles
document.querySelectorAll('.level-card').forEach(card => {
    card.addEventListener('click', () => {
        currentLevel = card.dataset.level;
        showRules(); 
    });
});

// 2. Clic sur "Commencer le Quiz" (dans le modal) -> Démarre le quiz
startQuizBtn.addEventListener('click', startQuiz); 

// 3. Bouton "Question Suivante"
nextBtn.addEventListener('click', nextQuestion);

// 4. Bouton "Choisir un nouveau niveau" (dans le résultat)
restartBtn.addEventListener('click', () => {
    clearInterval(timerInterval);

    // Reset UI
    progressBar.style.width = "0%";
    progressText.textContent = "";
    timerDisplay.textContent = "⏳ 0 s";
    currentScoreDisplay.textContent = "Score : 0";

    // Screens
    resultsScreen.classList.remove('active');
    quizScreen.classList.remove('active');
    rulesScreen.classList.remove('active'); 
    introScreen.classList.add('active');
    
    updateBestScoresOnHome(); 
});

// Initialisation
updateBestScoresOnHome();