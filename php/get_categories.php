<?php
// Include database connection
require_once 'db_connect.php';

// Set header for JSON response
header('Content-Type: application/json');

try {
    // Fetch all categories with question count
    $sql = "SELECT 
                c.id,
                c.name,
                c.description,
                COUNT(q.id) as question_count
            FROM categories c
            LEFT JOIN questions q ON c.id = q.category_id
            GROUP BY c.id, c.name, c.description
            ORDER BY c.id";
    
    $result = $conn->query($sql);
    
    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }
    
    if (count($categories) > 0) {
        echo json_encode([
            'success' => true,
            'categories' => $categories
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'No categories found'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error fetching categories: ' . $e->getMessage()
    ]);
}

$conn->close();
?>