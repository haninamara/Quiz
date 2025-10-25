    const quizData = {
      beginner: [
        {
          question: "Quelle balise HTML est utilisée pour créer un lien hypertexte ?",
          answers: ["<link>", "<a>", "<href>"],
          correctAnswer: "<a>"
        },
        {
          question: "Quel attribut CSS modifie la couleur du texte ?",
          answers: ["color", "background-color", "font-style"],
          correctAnswer: "color"
        },
        {
          question: "Quel événement JavaScript est déclenché lors d'un clic ?",
          answers: ["onclick", "onhover", "onload"],
          correctAnswer: "onclick"
        },
        {
          question: "Quelle balise HTML crée un paragraphe ?",
          answers: ["<p>", "<paragraph>", "<text>"],
          correctAnswer: "<p>"
        },
        {
          question: "Comment inclure un fichier CSS externe en HTML ?",
          answers: ["<style src='style.css'>", "<link rel='stylesheet' href='style.css'>", "<css>style.css</css>"],
          correctAnswer: "<link rel='stylesheet' href='style.css'>"
        },
        {
          question: "Quelle propriété CSS contrôle la taille du texte ?",
          answers: ["font-size", "text-size", "size"],
          correctAnswer: "font-size"
        },
        {
          question: "Comment déclarer une variable en JavaScript moderne ?",
          answers: ["variable x = 5", "let x = 5", "var x := 5"],
          correctAnswer: "let x = 5"
        },
        {
          question: "Quelle balise HTML crée une liste non ordonnée ?",
          answers: ["<ul>", "<ol>", "<list>"],
          correctAnswer: "<ul>"
        }
      ],
      intermediate: [
        {
          question: "Quelle est la fonction principale du sélecteur '::before' en CSS ?",
          answers: ["Ajouter une classe à un élément", "Insérer du contenu avant un élément", "Déplacer un élément au début"],
          correctAnswer: "Insérer du contenu avant un élément"
        },
        {
          question: "Quel mot-clé déclare une variable constante en JavaScript ?",
          answers: ["var", "let", "const"],
          correctAnswer: "const"
        },
        {
          question: "Quel attribut HTML rend un champ obligatoire ?",
          answers: ["must", "required", "mandatory"],
          correctAnswer: "required"
        },
        {
          question: "En Flexbox, quelle propriété centre sur l'axe secondaire ?",
          answers: ["justify-content", "align-items", "flex-direction"],
          correctAnswer: "align-items"
        },
        {
          question: "Quelle méthode JavaScript ajoute un élément à la fin d'un tableau ?",
          answers: ["push()", "add()", "append()"],
          correctAnswer: "push()"
        },
        {
          question: "Quelle propriété CSS crée un dégradé linéaire ?",
          answers: ["background-gradient", "linear-gradient()", "gradient"],
          correctAnswer: "linear-gradient()"
        },
        {
          question: "Comment sélectionner un élément par ID en JavaScript ?",
          answers: ["document.querySelector('#id')", "document.getElement('id')", "document.selectId('id')"],
          correctAnswer: "document.querySelector('#id')"
        },
        {
          question: "Quelle propriété CSS contrôle l'espacement entre les lignes ?",
          answers: ["line-height", "letter-spacing", "text-indent"],
          correctAnswer: "line-height"
        }
      ],
      advanced: [
        {
          question: "Quelle est la différence principale entre '==' et '===' en JavaScript ?",
          answers: ["'===' vérifie le type et la valeur", "'==' est plus rapide", "Aucune différence"],
          correctAnswer: "'===' vérifie le type et la valeur"
        },
        {
          question: "Quel est le rôle de 'event.preventDefault()' ?",
          answers: ["Annule le comportement par défaut", "Arrête la propagation", "Supprime l'événement"],
          correctAnswer: "Annule le comportement par défaut"
        },
        {
          question: "En CSS Grid, que fait 'grid-template-areas' ?",
          answers: ["Définit des zones nommées", "Crée des colonnes", "Définit l'espacement"],
          correctAnswer: "Définit des zones nommées"
        },
        {
          question: "Qu'est-ce qu'une closure en JavaScript ?",
          answers: ["Une fonction qui accède à son scope externe", "Une boucle fermée", "Un objet immuable"],
          correctAnswer: "Une fonction qui accède à son scope externe"
        },
        {
          question: "Quelle propriété CSS crée un contexte de empilement (stacking context) ?",
          answers: ["z-index avec position", "stack-order", "layer"],
          correctAnswer: "z-index avec position"
        },
        {
          question: "Que retourne 'Promise.all()' si une promesse échoue ?",
          answers: ["Rejette immédiatement", "Attend toutes les promesses", "Retourne un tableau vide"],
          correctAnswer: "Rejette immédiatement"
        },
        {
          question: "Quel sélecteur CSS cible le premier enfant d'un type spécifique ?",
          answers: [":first-of-type", ":first-child", ":nth-child(1)"],
          correctAnswer: ":first-of-type"
        },
        {
          question: "Que signifie 'hoisting' en JavaScript ?",
          answers: ["Les déclarations sont remontées en haut du scope", "L'optimisation du code", "La compression des fichiers"],
          correctAnswer: "Les déclarations sont remontées en haut du scope"
        }
      ]
    };

    let currentLevel = '';
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let answerSelected = false;

    const introScreen = document.getElementById('intro-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    const questionText = document.getElementById('question-text');
    const answerButtonsContainer = document.getElementById('answer-buttons');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const finalScore = document.getElementById('final-score');
    const totalQuestionsSpan = document.getElementById('total-questions');
    const resultMessage = document.getElementById('result-message');
    const feedbackOverlay = document.getElementById('feedback-overlay');

    document.querySelectorAll('.level-card').forEach(card => {
      card.addEventListener('click', () => {
        currentLevel = card.dataset.level;
        startQuiz();
      });
    });

    function startQuiz() {
      currentQuestions = quizData[currentLevel];
      currentQuestionIndex = 0;
      score = 0;
      answerSelected = false;

      introScreen.classList.remove('active');
      resultsScreen.classList.remove('active');
      quizScreen.classList.add('active');

      totalQuestionsSpan.textContent = currentQuestions.length;
      displayQuestion();
    }

    function displayQuestion() {
      if (currentQuestionIndex >= currentQuestions.length) {
        showResults();
        return;
      }

      const currentQuestion = currentQuestions[currentQuestionIndex];
      questionText.textContent = currentQuestion.question;
      answerButtonsContainer.innerHTML = '';
      nextBtn.classList.add('hidden');
      nextBtn.disabled = true;
      answerSelected = false;

      const progress = ((currentQuestionIndex) / currentQuestions.length) * 100;
      progressBar.style.width = progress + '%';
      progressText.textContent = `Question ${currentQuestionIndex + 1} / ${currentQuestions.length}`;

      currentQuestion.answers.forEach(answer => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.classList.add('btn-answer');
        button.addEventListener('click', () => checkAnswer(button, currentQuestion.correctAnswer));
        answerButtonsContainer.appendChild(button);
      });
    }

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

    function checkAnswer(selectedButton, correctAnswer) {
      if (answerSelected) return;
      answerSelected = true;

      const isCorrect = selectedButton.textContent === correctAnswer;

      if (isCorrect) {
        score++;
        selectedButton.classList.add('correct');
        createConfetti(selectedButton);
        showFeedbackOverlay('🎉', 'correct');
      } else {
        selectedButton.classList.add('wrong');
        showFeedbackOverlay('💭', 'wrong');
      }

      Array.from(answerButtonsContainer.children).forEach(button => {
        button.disabled = true;
        if (button.textContent === correctAnswer && !isCorrect) {
          button.classList.add('correct');
        }
      });

      nextBtn.classList.remove('hidden');
      nextBtn.disabled = false;
    }

    function showFeedbackOverlay(symbol, type) {
      const content = feedbackOverlay.querySelector('.feedback-content');
      content.textContent = symbol;
      feedbackOverlay.classList.remove('hidden', 'correct', 'wrong', 'show');
      feedbackOverlay.classList.add(type, 'show');

      setTimeout(() => {
        feedbackOverlay.classList.remove('show', type);
        feedbackOverlay.classList.add('hidden');
      }, 1200);
    }

    function nextQuestion() {
      currentQuestionIndex++;
      displayQuestion();
    }

    function showResults() {
      quizScreen.classList.remove('active');
      resultsScreen.classList.add('active');
      finalScore.textContent = score;

      const percentage = (score / currentQuestions.length) * 100;
      
      if (percentage === 100) {
        resultMessage.textContent = "🌟 Parfait ! Score impeccable !";
      } else if (percentage >= 75) {
        resultMessage.textContent = "💪 Excellent travail ! Vous maîtrisez le sujet !";
      } else if (percentage >= 50) {
        resultMessage.textContent = "👍 Bien joué ! Continuez à pratiquer.";
      } else {
        resultMessage.textContent = "💡 Bon début ! Revisitez les concepts de base.";
      }
    }

    nextBtn.addEventListener('click', nextQuestion);
    restartBtn.addEventListener('click', () => {
      resultsScreen.classList.remove('active');
      introScreen.classList.add('active');
    });