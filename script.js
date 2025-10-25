    // 1. Données du Quiz
    const quizQuestions = [
      {
        question: "Quelle est la fonction principale du sélecteur '::before' en CSS ?",
        answers: [
          "Ajouter une classe à un élément",
          "Insérer du contenu avant un élément",
          "Déplacer un élément au début de son conteneur",
        ],
        correctAnswer: "Insérer du contenu avant un élément",
      },
      {
        question: "Quel mot-clé JavaScript est utilisé pour déclarer une variable dont la valeur ne changera pas ?",
        answers: ["var", "let", "const"],
        correctAnswer: "const",
      },
      {
        question: "Quel attribut HTML rend un champ de formulaire obligatoire ?",
        answers: ["must", "required", "mandatory"],
        correctAnswer: "required",
      },
      {
        question: "En CSS Flexbox, quelle propriété centre un élément sur l'axe secondaire (cross axis) ?",
        answers: ["justify-content", "align-items", "flex-direction"],
        correctAnswer: "align-items",
      },
      {
    question: "Quelle balise HTML est utilisée pour créer un lien hypertexte ?",
    answers: ["<link>", "<a>", "<href>"],
    correctAnswer: "<a>",
  },
  {
    question: "Quel attribut CSS modifie la couleur du texte ?",
    answers: ["color", "background-color", "font-style"],
    correctAnswer: "color",
  },
  {
    question: "Quel événement JavaScript est déclenché lorsqu'un utilisateur clique sur un élément ?",
    answers: ["onclick", "onhover", "onload"],
    correctAnswer: "onclick",
  },
  {
    question: "En CSS, quelle propriété contrôle l'espacement entre les lignes de texte ?",
    answers: ["line-height", "letter-spacing", "text-indent"],
    correctAnswer: "line-height",
  },
    ];

    const introScreen = document.getElementById("intro-screen");
    const quizScreen = document.getElementById("quiz-screen");
    const resultsScreen = document.getElementById("results-screen");
    const startBtn = document.getElementById("start-btn");
    const nextBtn = document.getElementById("next-btn");
    const restartBtn = document.getElementById("restart-btn");
    const questionText = document.getElementById("question-text");
    const answerButtonsContainer = document.getElementById("answer-buttons");
    const feedback = document.getElementById("feedback");
    const finalScore = document.getElementById("final-score");
    const totalQuestionsSpan = document.getElementById("total-questions");
    const resultMessage = document.getElementById("result-message");

    // 3. Variables d'état
    let currentQuestionIndex = 0;
    let score = 0;
    let answerSelected = false;

    // 4. Fonctions principales
    function startQuiz() {
      currentQuestionIndex = 0;
      score = 0;
      answerSelected = false;

      introScreen.classList.remove("active");
      resultsScreen.classList.remove("active");
      quizScreen.classList.add("active");

      totalQuestionsSpan.textContent = quizQuestions.length;
      displayQuestion();
    }

    function displayQuestion() {
      if (currentQuestionIndex >= quizQuestions.length) {
        showResults();
        return;
      }

      const currentQuestion = quizQuestions[currentQuestionIndex];
      questionText.textContent = currentQuestion.question;
      answerButtonsContainer.innerHTML = "";
      feedback.textContent = "";
      nextBtn.classList.add("hidden");
      nextBtn.disabled = true;
      answerSelected = false;

      currentQuestion.answers.forEach((answer) => {
        const button = document.createElement("button");
        button.textContent = answer;
        button.classList.add("btn-answer");
        button.addEventListener("click", () => checkAnswer(button, currentQuestion.correctAnswer));
        answerButtonsContainer.appendChild(button);
      });
    }

    function showFeedbackOverlay(symbol, type) {
  const feedbackOverlay = document.getElementById("feedback-overlay");
  feedbackOverlay.textContent = symbol;
  feedbackOverlay.classList.remove("hidden", "correct", "wrong", "show");
  feedbackOverlay.classList.add(type, "show");

  // Hide overlay after 1 second
  setTimeout(() => {
    feedbackOverlay.classList.remove("show", type);
    feedbackOverlay.classList.add("hidden");
  }, 1000);
}


function checkAnswer(selectedButton, correctAnswer) {
  if (answerSelected) return;
  answerSelected = true;

  const isCorrect = selectedButton.textContent === correctAnswer;
  const feedbackOverlay = document.getElementById("feedback-overlay");

  if (isCorrect) {
    score++;
    selectedButton.classList.add("correct");
    showFeedbackOverlay("👍", "correct"); 
  } else {
    selectedButton.classList.add("wrong");
    showFeedbackOverlay("❌", "wrong"); 
  }

  Array.from(answerButtonsContainer.children).forEach((button) => {
    button.disabled = true;
    if (button.textContent === correctAnswer && !isCorrect) {
      button.classList.add("correct");
    }
  });

  nextBtn.classList.remove("hidden");
  nextBtn.disabled = false;
}

    function nextQuestion() {
      currentQuestionIndex++;
      displayQuestion();
    }

    function showResults() {
      quizScreen.classList.remove("active");
      resultsScreen.classList.add("active");
      finalScore.textContent = score;

      const percentage = (score / quizQuestions.length) * 100;
      if (percentage === 100) {
        resultMessage.textContent = "🌟 Incroyable ! Vous avez un 100% !";
      } else if (percentage >= 75) {
        resultMessage.textContent = "💪 Excellent ! Vous êtes un pro du web !";
      } else if (percentage >= 50) {
        resultMessage.textContent = "👍 Pas mal ! Continuez à pratiquer.";
      } else {
        resultMessage.textContent = "💡 Beaucoup d'apprentissage en perspective !";
      }
    }

    // 5. Événements
    startBtn.addEventListener("click", startQuiz);
    nextBtn.addEventListener("click", nextQuestion);
    restartBtn.addEventListener("click", startQuiz);