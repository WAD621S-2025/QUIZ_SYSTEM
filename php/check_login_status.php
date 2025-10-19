<?php
session_start();

header('Content-Type: application/json');

// Simple check if user is logged in
if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
    echo json_encode([
        'success' => true,
        'isLoggedIn' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'] ?? '',
            'full_name' => $_SESSION['full_name'] ?? '',
            'profile_picture' => $_SESSION['profile_picture'] ?? 'apple'
        ]
    ]);
} else {
    echo json_encode([
        'success' => true,
        'isLoggedIn' => false
    ]);
}
?>