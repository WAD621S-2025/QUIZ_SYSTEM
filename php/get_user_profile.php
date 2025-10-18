<?php
require_once 'auth_functions.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

try {
    $user_id = $_SESSION['user_id'];
    
    // Get user basic info
    $stmt = $conn->prepare("
        SELECT 
            u.id,
            u.username,
            u.email,
            u.full_name,
            u.profile_picture,
            u.date_joined,
            u.total_quizzes,
            COUNT(DISTINCT r.category_id) as categories_attempted,
            ROUND(AVG(r.score / r.total_questions * 100), 2) as average_score,
            MAX(r.score / r.total_questions * 100) as best_score,
            SUM(CASE WHEN r.score = r.total_questions THEN 1 ELSE 0 END) as perfect_scores
        FROM users u
        LEFT JOIN results r ON u.id = r.user_id
        WHERE u.id = ?
        GROUP BY u.id
    ");
    
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    // Count completed categories (>= 70% score)
    $stmt = $conn->prepare("
        SELECT COUNT(DISTINCT category_id) as categories_completed
        FROM results
        WHERE user_id = ? AND (score / total_questions * 100) >= 70
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $completed_result = $stmt->get_result();
    $completed_data = $completed_result->fetch_assoc();
    
    $user['categories_completed'] = $completed_data['categories_completed'] ?? 0;
    
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>