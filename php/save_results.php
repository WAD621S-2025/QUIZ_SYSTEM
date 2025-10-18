<?php
session_start();
require_once 'db_connect.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$user_name = isset($data['user_name']) ? trim($data['user_name']) : 'Anonymous';
$category_id = isset($data['category_id']) ? intval($data['category_id']) : 0;
$score = isset($data['score']) ? intval($data['score']) : 0;
$total_questions = isset($data['total_questions']) ? intval($data['total_questions']) : 0;
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if ($category_id <= 0 || $total_questions <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid data provided']);
    exit;
}

try {
    // Insert result into database
    if ($user_id) {
        // Logged-in user
        $stmt = $conn->prepare("INSERT INTO results (user_id, user_name, category_id, score, total_questions) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("isiii", $user_id, $user_name, $category_id, $score, $total_questions);
    } else {
        // Guest user
        $stmt = $conn->prepare("INSERT INTO results (user_name, category_id, score, total_questions) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("siii", $user_name, $category_id, $score, $total_questions);
    }
    
    if ($stmt->execute()) {
        $result_id = $conn->insert_id;
        
        // If user is logged in, update user stats
        if ($user_id) {
            // Update total quizzes count
            $conn->query("UPDATE users SET total_quizzes = total_quizzes + 1 WHERE id = $user_id");
            
            // Update category stats
            $percentage = round(($score / $total_questions) * 100, 2);
            
            $stmt = $conn->prepare("
                INSERT INTO user_category_stats 
                (user_id, category_id, attempts, best_score, best_percentage, total_questions_answered, correct_answers, last_attempt, completed)
                VALUES (?, ?, 1, ?, ?, ?, ?, NOW(), ?)
                ON DUPLICATE KEY UPDATE
                    attempts = attempts + 1,
                    best_score = GREATEST(best_score, ?),
                    best_percentage = GREATEST(best_percentage, ?),
                    total_questions_answered = total_questions_answered + ?,
                    correct_answers = correct_answers + ?,
                    last_attempt = NOW(),
                    completed = CASE WHEN ? >= 70 THEN 1 ELSE completed END
            ");
            
            $completed = ($percentage >= 70) ? 1 : 0;
            
            $stmt->bind_param(
                "iiidiiidiiii",
                $user_id, $category_id, $score, $percentage, $total_questions, $score, $completed,
                $score, $percentage, $total_questions, $score, $percentage
            );
            $stmt->execute();
            
            // Delete saved progress for this category
            $stmt = $conn->prepare("DELETE FROM user_progress WHERE user_id = ? AND category_id = ?");
            $stmt->bind_param("ii", $user_id, $category_id);
            $stmt->execute();
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Results saved successfully',
            'result_id' => $result_id
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to save results']);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error saving results: ' . $e->getMessage()]);
}

$conn->close();
?>