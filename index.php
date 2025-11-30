<?php
// Fichier : index.php

require 'quiz_api.php'; // Renommé le fichier de l'API
$currentLevel = $_GET['level'] ?? 'intro'; // Le niveau sélectionné, 'intro' par défaut
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
    $totalScore = 0;
    // Note: Le calcul du temps/bonus est complexe à gérer sans JS/AJAX lors de la soumission unique.
    // Nous utiliserons le score de base de 10 points par question pour cette version simplifiée.
    $points_per_question = 10; 

    foreach ($userAnswers as $question_id => $answer_id) {
        $q_id = (int)$question_id;
        $a_id = (int)$answer_id;

        // Validation côté serveur
        if (checkAnswer($pdo, $q_id, $a_id)) {
            $totalScore += $points_per_question;
        }
    }

    if (!empty($username)) {
        saveScore($pdo, $username, $level, $totalScore);
    }
    
    $finalScore = $totalScore;
    $resultsMessage = "Quiz terminé. Votre score final est de **{$finalScore} points**.";
    $quizComplete = true; 
    $currentLevel = 'results'; // Affiche l'écran des résultats
} 

// --- 2. Chargement des questions pour l'affichage du quiz ---
elseif ($currentLevel !== 'intro' && $currentLevel !== 'results' && $currentLevel !== 'ranking') {
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
                            <li>Chaque bonne réponse rapporte **10 points**.</li>
                            <li>Le temps n'est pas utilisé pour le score, mais un maximum de **10 questions** seront affichées.</li>
                        </ul>
                        <button type="submit" class="cta-btn">Commencer le Quiz !</button>
                    </form>
                </div>
            </div>

        <?php elseif (!empty($questions)): ?>
            <div id="quiz-screen" class="screen active">
                <h2>Quiz - Niveau : <?php echo ucfirst($currentLevel); ?></h2>
                
                <div class="info-bar">
                    <div id="timer" class="timer">⏳ Temps : 30 s (UI)</div>
                    <div id="current-score" class="score-display">Score : 0 (UI)</div>
                </div>

                <form method="POST" action="index.php">
                    <input type="hidden" name="action" value="submit_quiz">
                    <input type="hidden" name="level" value="<?php echo $currentLevel; ?>">
                    <input type="hidden" name="username" value="<?php echo htmlspecialchars($_GET['username'] ?? 'Anonymous'); ?>">

                    <?php $q_index = 1; foreach ($questions as $q): ?>
                        <div class="question-block" style="margin-bottom: 30px; padding: 15px; border: 1px solid #ccc; border-radius: 8px;">
                            <h3><?php echo $q_index; ?>. <?php echo htmlspecialchars($q['texte_question']); ?></h3>
                            
                            <div class="btn-grid">
                                <?php foreach ($q['reponses'] as $r): ?>
                                    <label class="btn-answer-label">
                                        <input type="radio" name="answers[<?php echo $q['id']; ?>]" value="<?php echo $r['id']; ?>" required>
                                        <?php echo htmlspecialchars($r['texte_reponse']); ?>
                                    </label>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php $q_index++; endforeach; ?>

                    <button type="submit" class="cta-btn submit-btn">Terminer le Quiz et Voir le Résultat</button>
                </form>

            </div>

        <?php elseif ($currentLevel === 'results' && $quizComplete): ?>
            <div id="results-screen" class="screen active">
                <h2>🎉 Quiz Terminé !</h2>
                <p id="total-final-score-text">Score de <?php echo htmlspecialchars($username); ?>:</p>
                <div class="score-badge">
                    <span id="final-score"><?php echo $finalScore; ?></span> pts
                </div>
                <p id="result-message"><?php echo $resultsMessage; ?></p>
                <a href="index.php" class="cta-btn">Choisir un nouveau niveau</a>
                <a href="?level=ranking" class="cta-btn">Voir le Classement</a>
            </div>

        <?php elseif ($currentLevel === 'ranking'): ?>
            <div id="ranking-screen" class="screen active">
                <h2>🏆 Classement des Meilleurs Scores</h2>
                <div id="ranking-list" class="rules-content">
                    <?php if (!empty($ranking)): ?>
                        <table>
                            <thead>
                                <tr><th>#</th><th>Nom</th><th>Score</th><th>Niveau</th><th>Date</th></tr>
                            </thead>
                            <tbody>
                                <?php foreach ($ranking as $index => $entry): ?>
                                    <tr>
                                        <td><?php echo $index + 1; ?></td>
                                        <td><?php echo htmlspecialchars($entry['nom_utilisateur']); ?></td>
                                        <td><strong><?php echo htmlspecialchars($entry['score_final']); ?></strong></td>
                                        <td><?php echo htmlspecialchars(ucfirst($entry['niveau_quiz'])); ?></td>
                                        <td><?php echo htmlspecialchars($entry['date_formattee']); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php else: ?>
                        <p>Aucun score n'est encore enregistré.</p>
                    <?php endif; ?>
                </div>
                <a href="index.php" class="cta-btn">Retour à l'accueil</a>
            </div>

        <?php endif; ?>
    </div>

    </body>
    <script src="script.js"></script>
</html>