// Quiz Interactive JavaScript
// =========================

// Configuration
const CONFIG = {
    questionTime: 30, // Temps par question en secondes
    basePoints: 10, // Points de base par bonne réponse
    timeBonus: 5, // Bonus si réponse rapide (< 10s)
    penaltyPoints: 0 // Pénalité pour mauvaise réponse (0 = pas de pénalité)
};

// État du quiz
let state = {
    currentQuestionIndex: 0,
    score: 0,
    timer: null,
    timeRemaining: CONFIG.questionTime,
    questions: [],
    userAnswers: []
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initQuiz();
});

// Fonction d'initialisation
function initQuiz() {
    // Vérifier si on est sur la page du quiz
    const quizScreen = document.getElementById('quiz-screen');
    if (!quizScreen || !quizScreen.classList.contains('active')) {
        return;
    }

    // Récupérer toutes les questions depuis le DOM
    const questionBlocks = document.querySelectorAll('.question-block');
    state.questions = Array.from(questionBlocks);

    if (state.questions.length === 0) {
        return;
    }

    // Masquer toutes les questions
    state.questions.forEach(q => q.style.display = 'none');

    // Masquer le bouton de soumission initial
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.style.display = 'none';
    }

    // Afficher la première question
    showQuestion(0);

    // Ajouter les événements aux boutons de réponse
    setupAnswerButtons();

    // Créer l'overlay de feedback
    createFeedbackOverlay();

    // Initialiser l'affichage du score
    updateScoreDisplay();
}

// Afficher une question spécifique
function showQuestion(index) {
    if (index >= state.questions.length) {
        // Quiz terminé
        endQuiz();
        return;
    }

    state.currentQuestionIndex = index;
    const question = state.questions[index];

    // Masquer toutes les questions
    state.questions.forEach(q => q.style.display = 'none');

    // Afficher la question actuelle avec animation
    question.style.display = 'block';
    question.style.animation = 'fadeIn 0.6s ease';

    // Mettre à jour la barre de progression
    updateProgress();

    // Démarrer le timer
    startTimer();
}

// Démarrer le timer
function startTimer() {
    state.timeRemaining = CONFIG.questionTime;
    updateTimerDisplay();

    // Nettoyer l'ancien timer si existant
    if (state.timer) {
        clearInterval(state.timer);
    }

    // Créer un nouveau timer
    state.timer = setInterval(() => {
        state.timeRemaining--;
        updateTimerDisplay();

        // Changer la couleur du timer quand il reste peu de temps
        const timerElement = document.getElementById('timer');
        if (state.timeRemaining <= 10) {
            timerElement.style.background = 'linear-gradient(135deg, #ff7675, #d63031)';
            timerElement.style.animation = 'pulse 1s infinite';
        }

        // Temps écoulé
        if (state.timeRemaining <= 0) {
            clearInterval(state.timer);
            handleTimeout();
        }
    }, 1000);
}

// Gérer le timeout
function handleTimeout() {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    const answerLabels = currentQuestion.querySelectorAll('.btn-answer-label');
    
    // Désactiver tous les boutons
    answerLabels.forEach(label => {
        label.style.pointerEvents = 'none';
        label.style.opacity = '0.5';
    });

    // Afficher le feedback de timeout
    showFeedback(false, 0, true);

    // Passer à la question suivante après un délai
    setTimeout(() => {
        showQuestion(state.currentQuestionIndex + 1);
    }, 2000);
}

// Mettre à jour l'affichage du timer
function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = `⏳ Temps : ${state.timeRemaining}s`;
    }
}

// Mettre à jour l'affichage du score
function updateScoreDisplay() {
    const scoreElement = document.getElementById('current-score');
    if (scoreElement) {
        scoreElement.textContent = `Score : ${state.score}`;
    }
}

// Mettre à jour la barre de progression
function updateProgress() {
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    
    if (progressBar && progressText) {
        const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Question ${state.currentQuestionIndex + 1} sur ${state.questions.length}`;
    }
}

// Configurer les événements des boutons de réponse
function setupAnswerButtons() {
    state.questions.forEach((question, questionIndex) => {
        const answerLabels = question.querySelectorAll('.btn-answer-label');
        const radioInputs = question.querySelectorAll('input[type="radio"]');

        answerLabels.forEach((label, answerIndex) => {
            label.addEventListener('click', function(e) {
                // Vérifier si c'est la question actuelle
                if (questionIndex !== state.currentQuestionIndex) {
                    e.preventDefault();
                    return;
                }

                // Arrêter le timer
                clearInterval(state.timer);

                // Désactiver tous les boutons de cette question
                answerLabels.forEach(l => {
                    l.style.pointerEvents = 'none';
                });

                // Récupérer la valeur de la réponse
                const selectedInput = label.querySelector('input[type="radio"]');
                const answerId = selectedInput.value;

                // Vérifier la réponse via AJAX
                checkAnswer(question, answerId, label, answerLabels);
            });
        });
    });
}

// Vérifier la réponse
function checkAnswer(questionElement, answerId, selectedLabel, allLabels) {
    const questionId = questionElement.querySelector('input[type="radio"]').name.match(/\d+/)[0];

    // Appel AJAX pour vérifier la réponse
    fetch('check_answer.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `question_id=${questionId}&answer_id=${answerId}`
    })
    .then(response => response.json())
    .then(data => {
        const isCorrect = data.correct;
        
        // Calculer les points
        let points = 0;
        if (isCorrect) {
            points = CONFIG.basePoints;
            // Bonus de temps si réponse rapide
            if (state.timeRemaining > 20) {
                points += CONFIG.timeBonus;
            }
            state.score += points;
        } else {
            points = -CONFIG.penaltyPoints;
            state.score = Math.max(0, state.score + points);
        }

        // Mettre à jour le score
        updateScoreDisplay();

        // Appliquer les styles visuels
        if (isCorrect) {
            selectedLabel.classList.add('correct');
            createConfetti(selectedLabel);
        } else {
            selectedLabel.classList.add('wrong');
            // Montrer la bonne réponse
            highlightCorrectAnswer(questionElement, allLabels);
        }

        // Afficher le feedback
        showFeedback(isCorrect, points);

        // Sauvegarder la réponse
        state.userAnswers.push({
            questionId: questionId,
            answerId: answerId,
            correct: isCorrect,
            points: points
        });

        // Passer à la question suivante après un délai
        setTimeout(() => {
            showQuestion(state.currentQuestionIndex + 1);
        }, 2500);
    })
    .catch(error => {
        console.error('Erreur lors de la vérification:', error);
        // En cas d'erreur, passer à la question suivante
        setTimeout(() => {
            showQuestion(state.currentQuestionIndex + 1);
        }, 1500);
    });
}

// Mettre en évidence la bonne réponse
function highlightCorrectAnswer(questionElement, allLabels) {
    // Chercher la bonne réponse via un appel API ou l'attribut data
    allLabels.forEach(label => {
        const input = label.querySelector('input[type="radio"]');
        // On pourrait ajouter un attribut data-correct dans le PHP
        // Pour l'instant, on fait une requête supplémentaire
        const answerId = input.value;
        const questionId = input.name.match(/\d+/)[0];
        
        fetch('check_answer.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `question_id=${questionId}&answer_id=${answerId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.correct && !label.classList.contains('correct')) {
                label.style.borderColor = '#55efc4';
                label.style.background = 'linear-gradient(135deg, rgba(85, 239, 196, 0.2), rgba(0, 184, 148, 0.2))';
            }
        });
    });
}

// Créer l'overlay de feedback
function createFeedbackOverlay() {
    if (document.getElementById('feedback-overlay')) {
        return; // Déjà créé
    }

    const overlay = document.createElement('div');
    overlay.id = 'feedback-overlay';
    overlay.className = 'feedback-overlay';
    overlay.innerHTML = '<div class="feedback-content"></div>';
    document.body.appendChild(overlay);
}

// Afficher le feedback
function showFeedback(isCorrect, points, isTimeout = false) {
    const overlay = document.getElementById('feedback-overlay');
    const content = overlay.querySelector('.feedback-content');

    if (isTimeout) {
        overlay.className = 'feedback-overlay wrong show';
        content.textContent = '⏰ Temps écoulé !';
    } else if (isCorrect) {
        overlay.className = 'feedback-overlay correct show';
        content.textContent = `✓ Correct ! +${points} pts`;
    } else {
        overlay.className = 'feedback-overlay wrong show';
        content.textContent = points < 0 ? `✗ Incorrect ${points} pts` : '✗ Incorrect';
    }

    // Masquer après l'animation
    setTimeout(() => {
        overlay.classList.remove('show');
    }, 1200);
}

// Créer des confettis
function createConfetti(element) {
    const colors = ['#55efc4', '#00b894', '#74b9ff', '#a29bfe', '#fd79a8', '#ffeaa7'];
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = centerX + 'px';
        confetti.style.top = centerY + 'px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.transform = `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px)`;
        
        document.body.appendChild(confetti);

        // Supprimer après l'animation
        setTimeout(() => confetti.remove(), 1000);
    }
}

// Terminer le quiz
function endQuiz() {
    // Arrêter le timer s'il est en cours
    if (state.timer) {
        clearInterval(state.timer);
    }

    // Masquer l'écran du quiz
    const quizScreen = document.getElementById('quiz-screen');
    if (quizScreen) {
        quizScreen.classList.remove('active');
        quizScreen.style.display = 'none';
    }

    // Créer ou afficher l'écran des résultats
    let resultsScreen = document.getElementById('results-screen');
    
    if (!resultsScreen) {
        // Créer l'écran des résultats
        resultsScreen = document.createElement('div');
        resultsScreen.id = 'results-screen';
        resultsScreen.className = 'screen active';
        
        const username = getUsername();
        const level = getCurrentLevel();
        
        resultsScreen.innerHTML = `
            <h2>🎉 Quiz Terminé !</h2>
            <p id="total-final-score-text">Score de <strong>${username}</strong> :</p>
            <div class="score-badge">
                <span id="final-score">${state.score}</span> pts
            </div>
            <p id="result-message">${getResultMessage(state.score)}</p>
            
            <div style="margin: 30px 0;">
                <h3 style="color: var(--primary-color); margin-bottom: 15px;">📊 Résumé de vos réponses</h3>
                <div id="answers-summary" style="text-align: left; max-height: 300px; overflow-y: auto; background: #f8f9fa; padding: 20px; border-radius: 15px;">
                    ${generateAnswersSummary()}
                </div>
            </div>
            
            <button onclick="saveScoreAndContinue()" class="cta-btn">💾 Sauvegarder mon score</button>
            <a href="?level=ranking" class="cta-btn" style="margin-top: 10px;">Voir le Classement 🏆</a>
            <a href="index.php" class="cta-btn" style="margin-top: 10px; background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));">Nouveau Quiz 🔄</a>
        `;
        
        document.querySelector('.quiz-container').appendChild(resultsScreen);
    } else {
        resultsScreen.classList.add('active');
        resultsScreen.style.display = 'block';
    }

    // Faire défiler vers le haut
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Générer le résumé des réponses
function generateAnswersSummary() {
    let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';
    
    state.userAnswers.forEach((answer, index) => {
        const icon = answer.correct ? '✅' : '❌';
        const color = answer.correct ? 'var(--success-dark)' : 'var(--error-dark)';
        const points = answer.points > 0 ? `+${answer.points}` : answer.points;
        
        html += `
            <div style="padding: 12px; background: white; border-radius: 10px; border-left: 4px solid ${color};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600;">${icon} Question ${index + 1}</span>
                    <span style="color: ${color}; font-weight: 700;">${points} pts</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Stats globales
    const correctCount = state.userAnswers.filter(a => a.correct).length;
    const totalQuestions = state.userAnswers.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    
    html = `
        <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 2px solid var(--primary-color);">
            <div style="display: flex; justify-content: space-around; text-align: center;">
                <div>
                    <div style="font-size: 2rem; color: var(--success-dark);">${correctCount}</div>
                    <div style="font-size: 0.9rem; color: var(--text-light);">Correctes</div>
                </div>
                <div>
                    <div style="font-size: 2rem; color: var(--error-dark);">${totalQuestions - correctCount}</div>
                    <div style="font-size: 0.9rem; color: var(--text-light);">Incorrectes</div>
                </div>
                <div>
                    <div style="font-size: 2rem; color: var(--primary-color);">${percentage}%</div>
                    <div style="font-size: 0.9rem; color: var(--text-light);">Réussite</div>
                </div>
            </div>
        </div>
    ` + html;
    
    return html;
}

// Message de résultat basé sur le score
function getResultMessage(score) {
    if (score >= 100) {
        return '🏆 <span style="color: var(--success-dark);">Excellent ! Vous êtes un expert !</span>';
    } else if (score >= 70) {
        return '🌟 <span style="color: var(--primary-color);">Très bien ! Continuez comme ça !</span>';
    } else if (score >= 40) {
        return '👍 <span style="color: var(--intermediate-color);">Bon travail ! Quelques révisions et ce sera parfait !</span>';
    } else {
        return '💪 <span style="color: var(--text-light);">Bon début ! Réessayez pour améliorer votre score !</span>';
    }
}

// Sauvegarder le score et permettre de continuer
function saveScoreAndContinue() {
    const username = getUsername();
    const level = getCurrentLevel();
    
    // Désactiver le bouton pendant la sauvegarde
    const saveBtn = event.target;
    saveBtn.disabled = true;
    saveBtn.textContent = '💾 Sauvegarde en cours...';
    
    // Préparer les données pour la soumission
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'index.php';

    // Action
    const actionInput = document.createElement('input');
    actionInput.type = 'hidden';
    actionInput.name = 'action';
    actionInput.value = 'submit_quiz';
    form.appendChild(actionInput);

    // Niveau
    const levelInput = document.createElement('input');
    levelInput.type = 'hidden';
    levelInput.name = 'level';
    levelInput.value = level;
    form.appendChild(levelInput);

    // Nom d'utilisateur
    const usernameInput = document.createElement('input');
    usernameInput.type = 'hidden';
    usernameInput.name = 'username';
    usernameInput.value = username;
    form.appendChild(usernameInput);

    // Score
    const scoreInput = document.createElement('input');
    scoreInput.type = 'hidden';
    scoreInput.name = 'final_score';
    scoreInput.value = state.score;
    form.appendChild(scoreInput);

    // Réponses de l'utilisateur
    state.userAnswers.forEach(answer => {
        const answerInput = document.createElement('input');
        answerInput.type = 'hidden';
        answerInput.name = `answers[${answer.questionId}]`;
        answerInput.value = answer.answerId;
        form.appendChild(answerInput);
    });

    // Ajouter le formulaire au DOM et le soumettre
    document.body.appendChild(form);
    form.submit();
}

// Récupérer le niveau actuel depuis l'URL ou le DOM
function getCurrentLevel() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('level') || 'beginner';
}

// Récupérer le nom d'utilisateur depuis l'URL ou le DOM
function getUsername() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('username') || 'Anonymous';
}

// Animation de pulsation pour le timer
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);