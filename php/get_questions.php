<?php
// Include database connection
require_once 'db_connect.php';

// Set header for JSON response
header('Content-Type: application/json');

// Get category ID from request
$category_id = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;

if ($category_id <= 0) {
    echo json_encode(['error' => 'Invalid category ID']);
    exit;
}

try {
    // Fetch questions from database - randomized
    $sql = "SELECT 
                q.id,
                q.question_text,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.correct_answer,
                q.text_answer,
                q.explanation,
                q.question_type,
                c.name as category_name
            FROM questions q
            JOIN categories c ON q.category_id = c.id
            WHERE q.category_id = ?
            ORDER BY RAND()";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $category_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $questions = [];
    while ($row = $result->fetch_assoc()) {
        $questions[] = $row;
    }
    
    if (count($questions) > 0) {
        echo json_encode([
            'success' => true,
            'category_name' => $questions[0]['category_name'],
            'total_questions' => count($questions),
            'questions' => $questions
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'No questions found for this category'
        ]);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error fetching questions: ' . $e->getMessage()
    ]);
}

$conn->close();
?>