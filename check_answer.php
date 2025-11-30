<?php

header('Content-Type: application/json');

require 'quiz_api.php';

// Vérifier que c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// Récupérer les paramètres
$questionId = isset($_POST['question_id']) ? (int)$_POST['question_id'] : 0;
$answerId = isset($_POST['answer_id']) ? (int)$_POST['answer_id'] : 0;

// Validation
if ($questionId <= 0 || $answerId <= 0) {
    echo json_encode(['error' => 'Paramètres invalides', 'correct' => false]);
    exit;
}

// Vérifier la réponse
$isCorrect = checkAnswer($pdo, $questionId, $answerId);

// Retourner le résultat
echo json_encode([
    'correct' => $isCorrect,
    'question_id' => $questionId,
    'answer_id' => $answerId
]);
?>