<?php

require 'quiz_api.php';
$currentLevel = $_GET['level'] ?? 'intro';
$questions = [];
$quizComplete = false;
$finalScore = 0;
$username = '';
$resultsMessage = '';

// --- 1. Gestion de la soumission du quiz ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'submit_quiz') {
    
    $userAnswers = $_POST['answers'] ?? [];
    $level = $_POST['level'] ?? 'unknown';
    $username = htmlspecialchars($_POST['username'] ?? 'Anonymous');
    
    // Le score final est maintenant calculé par JavaScript
    $finalScore = isset($_POST['final_score']) ? (int)$_POST['final_score'] : 0;

    // Sauvegarder le score
    if (!empty($username) && $finalScore > 0) {
        saveScore($pdo, $username, $level, $finalScore);
    }
    
    $resultsMessage = "Félicitations ! Vous avez terminé le quiz.";
    $quizComplete = true; 
    $currentLevel = 'results';
} 

// --- 2. Chargement des questions pour l'affichage du quiz ---
elseif ($currentLevel !== 'intro' && $currentLevel !== 'results' && $currentLevel !== 'ranking' && $currentLevel !== 'rules') {
    $questions = getQuestionsByLevel($pdo, $currentLevel);
}

// --- 3. Gestion de l'affichage du classement ---
elseif ($currentLevel === 'ranking') {
    $ranking = getHighScores($pdo);
}

?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz du Développeur Web 🚀</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="quiz-container">
        <h1>🧠 Quiz du Développeur Web</h1>

        <?php if ($currentLevel === 'intro'): ?>
            <div id="intro-screen" class="screen active">
                <p>Testez vos connaissances en HTML, CSS et JavaScript.<br>Choisissez votre niveau et relevez le défi ! 🚀</p>
                
                <div class="level-grid">
                    <?php foreach (['beginner', 'intermediate', 'advanced'] as $level_key): ?>
                        <a href="?level=rules&quiz_level=<?php echo $level_key; ?>" class="level-card <?php echo $level_key; ?>">
                            <div class="level-icon"><?php echo ($level_key === 'beginner' ? '🌱' : ($level_key === 'intermediate' ? '⚡' : '🔥')); ?></div>
                            <div class="level-title"><?php echo ucfirst($level_key); ?></div>
                            <div class="level-desc">Questions <?php echo ($level_key === 'beginner' ? 'basiques' : ($level_key === 'intermediate' ? 'avancées' : 'complexes')); ?></div>
                            <div class="best-score"></div>
                        </a>
                    <?php endforeach; ?>
                </div>
                <a href="?level=ranking" class="cta-btn">Voir le Classement 🏆</a>
            </div>
        
        <?php elseif ($currentLevel === 'rules' && isset($_GET['quiz_level'])): 
            $quizLevel = htmlspecialchars($_GET['quiz_level']);
        ?>
            <div id="rules-screen" class="screen active">
                <h2>📜 Règles du Quiz : <?php echo ucfirst($quizLevel); ?></h2>
                <div class="rules-content">
                    <p>Bienvenue ! Veuillez entrer votre nom pour le classement.</p>
                    
                    <form method="GET" action="index.php">
                        <input type="hidden" name="level" value="<?php echo $quizLevel; ?>">
                        <div class="user-input-section" style="margin-bottom: 20px;">
                            <label for="username-input" style="display: block; font-weight: 600; margin-bottom: 5px;">Entrez votre nom :</label>
                            <input type="text" id="username-input" name="username" placeholder="Votre nom" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 10px; font-size: 1rem;">
                        </div>

                        <ul id="rules-list">
                            <li>⏱️ Vous avez <strong>30 secondes</strong> par question.</li>
                            <li>✅ Chaque bonne réponse rapporte <strong>10 points</strong>.</li>
                            <li>⚡ Répondez rapidement (moins de 10s) pour un <strong>bonus de +5 points</strong> !</li>
                            <li>🏆 Votre score sera enregistré dans le classement.</li>
                        </ul>
                        <button type="submit" class="cta-btn">Commencer le Quiz !</button>
                    </form>
                </div>
            </div>

        <?php elseif (!empty($questions)): ?>
            <div id="quiz-screen" class="screen active">
                <h2>Quiz - Niveau : <?php echo ucfirst($currentLevel); ?></h2>
                
                <div class="info-bar">
                    <div id="timer" class="timer">⏳ Temps : 30s</div>
                    <div id="current-score" class="score-display">Score : 0</div>
                </div>

                <div class="progress-container">
                    <div class="progress-bar"></div>
                </div>
                <p class="progress-text">Question 1 sur <?php echo count($questions); ?></p>

                <div id="questions-container">
                    <?php $q_index = 1; foreach ($questions as $q): ?>
                        <div class="question-block" data-question-id="<?php echo $q['id']; ?>">
                            <h3><?php echo $q_index; ?>. <?php echo htmlspecialchars($q['texte_question']); ?></h3>
                            
                            <div class="btn-grid">
                                <?php foreach ($q['reponses'] as $r): ?>
                                    <label class="btn-answer-label <?php echo ($q['type_question'] === 'boolean' ? 'btn-boolean' : ''); ?>">
                                        <input type="radio" name="answers[<?php echo $q['id']; ?>]" value="<?php echo $r['id']; ?>" required style="display: none;">
                                        <?php echo htmlspecialchars($r['texte_reponse']); ?>
                                    </label>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php $q_index++; endforeach; ?>
                </div>

                <!-- Le formulaire de soumission sera créé dynamiquement par JavaScript -->
            </div>

        <?php elseif ($currentLevel === 'results' && $quizComplete): ?>
            <div id="results-screen" class="screen active">
                <h2>🎉 Quiz Terminé !</h2>
                <p id="total-final-score-text">Score de <?php echo htmlspecialchars($username); ?> :</p>
                <div class="score-badge">
                    <span id="final-score"><?php echo $finalScore; ?></span> pts
                </div>
                <p id="result-message"><?php echo $resultsMessage; ?></p>
                
                <?php if ($finalScore >= 100): ?>
                    <p style="font-size: 1.2rem; color: var(--success-dark); margin: 20px 0;">
                        🏆 Excellent ! Vous êtes un expert !
                    </p>
                <?php elseif ($finalScore >= 50): ?>
                    <p style="font-size: 1.2rem; color: var(--primary-color); margin: 20px 0;">
                        👍 Très bien ! Continuez comme ça !
                    </p>
                <?php else: ?>
                    <p style="font-size: 1.2rem; color: var(--text-light); margin: 20px 0;">
                        💪 Bon début ! Réessayez pour améliorer votre score !
                    </p>
                <?php endif; ?>

                <a href="index.php" class="cta-btn">Choisir un nouveau niveau</a>
                <a href="?level=ranking" class="cta-btn" style="margin-top: 10px;">Voir le Classement</a>
            </div>

        <?php elseif ($currentLevel === 'ranking'): ?>
            <div id="ranking-screen" class="screen active">
                <h2>🏆 Classement des Meilleurs Scores</h2>
                <div id="ranking-list" class="rules-content">
                    <?php if (!empty($ranking)): ?>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                            <thead>
                                <tr>
                                    <th style="padding: 12px; text-align: left; background: var(--secondary-color); color: var(--white);">#</th>
                                    <th style="padding: 12px; text-align: left; background: var(--secondary-color); color: var(--white);">Nom</th>
                                    <th style="padding: 12px; text-align: left; background: var(--secondary-color); color: var(--white);">Score</th>
                                    <th style="padding: 12px; text-align: left; background: var(--secondary-color); color: var(--white);">Niveau</th>
                                    <th style="padding: 12px; text-align: left; background: var(--secondary-color); color: var(--white);">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($ranking as $index => $entry): ?>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 12px;">
                                            <?php if ($index === 0): ?>
                                                🥇
                                            <?php elseif ($index === 1): ?>
                                                🥈
                                            <?php elseif ($index === 2): ?>
                                                🥉
                                            <?php else: ?>
                                                <?php echo $index + 1; ?>
                                            <?php endif; ?>
                                        </td>
                                        <td style="padding: 12px;"><strong><?php echo htmlspecialchars($entry['nom_utilisateur']); ?></strong></td>
                                        <td style="padding: 12px; color: var(--primary-color);"><strong><?php echo htmlspecialchars($entry['score_final']); ?> pts</strong></td>
                                        <td style="padding: 12px;"><?php echo htmlspecialchars(ucfirst($entry['niveau_quiz'])); ?></td>
                                        <td style="padding: 12px; font-size: 0.9rem; color: var(--text-light);"><?php echo htmlspecialchars($entry['date_formattee']); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php else: ?>
                        <p>Aucun score n'est encore enregistré. Soyez le premier à jouer !</p>
                    <?php endif; ?>
                </div>
                <a href="index.php" class="cta-btn">Retour à l'accueil</a>
            </div>

        <?php endif; ?>
    </div>

    <script src="script.js"></script>
</body>
</html>