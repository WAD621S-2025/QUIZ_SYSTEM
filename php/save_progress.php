<?php
require_once 'auth_functions.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $user_id = $_SESSION['user_id'];
    $category_id = intval($data['category_id'] ?? 0);
    $current_question = intval($data['current_question'] ?? 0);
    $total_questions = intval($data['total_questions'] ?? 0);
    $score = intval($data['score'] ?? 0);
    $user_answers = json_encode($data['user_answers'] ?? []);
    $questions_data = json_encode($data['questions'] ?? []);
    
    try {
        // Check if progress exists
        $stmt = $conn->prepare("SELECT id FROM user_progress WHERE user_id = ? AND category_id = ?");
        $stmt->bind_param("ii", $user_id, $category_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Update existing progress
            $stmt = $conn->prepare("UPDATE user_progress SET current_question = ?, score = ?, user_answers = ?, questions_data = ?, last_updated = NOW() WHERE user_id = ? AND category_id = ?");
            $stmt->bind_param("iissii", $current_question, $score, $user_answers, $questions_data, $user_id, $category_id);
        } else {
            // Insert new progress
            $stmt = $conn->prepare("INSERT INTO user_progress (user_id, category_id, current_question, total_questions, score, user_answers, questions_data) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("iiiiiss", $user_id, $category_id, $current_question, $total_questions, $score, $user_answers, $questions_data);
        }
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Progress saved']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to save progress']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>