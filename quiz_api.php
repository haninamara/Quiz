<?php

require 'db_connect.php'; 

function getQuestionsByLevel($pdo, $level, $limit = 10) {
    if (!in_array($level, ['beginner', 'intermediate', 'advanced'])) {
        return [];
    }

    $stmt = $pdo->prepare("SELECT id, texte_question, type_question, temps_limite_sec FROM questions WHERE niveau = :level ORDER BY RAND() LIMIT :limit");
    $stmt->bindParam(':level', $level, PDO::PARAM_STR);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($questions as &$q) {
        $q_id = $q['id'];
        
        // Récupérer l'ID et le texte de la réponse (ID est crucial)
        $stmt_rep = $pdo->prepare("SELECT id, texte_reponse FROM reponses WHERE question_id = :qid ORDER BY RAND()");
        $stmt_rep->bindParam(':qid', $q_id, PDO::PARAM_INT);
        $stmt_rep->execute();
        $q['reponses'] = $stmt_rep->fetchAll(PDO::FETCH_ASSOC);
        
    }

    return $questions;
}

function checkAnswer($pdo, $question_id, $submitted_answer_id) {
    // Cette fonction reste inchangée, elle est utilisée lors de la soumission du formulaire POST
    $stmt = $pdo->prepare("SELECT est_correct FROM reponses WHERE id = :rep_id AND question_id = :q_id");
    $stmt->bindParam(':rep_id', $submitted_answer_id, PDO::PARAM_INT);
    $stmt->bindParam(':q_id', $question_id, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    return $result && $result['est_correct'] == TRUE;
}

function saveScore($pdo, $username, $level, $score) {
    if (empty($username) || empty($level)) {
        return false;
    }
    
    $stmt = $pdo->prepare("INSERT INTO scores (nom_utilisateur, niveau_quiz, score_final) VALUES (:user, :level, :score)");
    
    $stmt->bindParam(':user', $username);
    $stmt->bindParam(':level', $level);
    $stmt->bindParam(':score', $score, PDO::PARAM_INT);
    
    return $stmt->execute();
}

function getHighScores($pdo, $limit = 10) {
    $stmt = $pdo->prepare("
        SELECT 
            nom_utilisateur, 
            niveau_quiz, 
            score_final, 
            DATE_FORMAT(date_enregistrement, '%d/%m/%Y %H:%i') AS date_formattee 
        FROM scores 
        ORDER BY score_final DESC, date_enregistrement ASC 
        LIMIT :limit
    ");
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}