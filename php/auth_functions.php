<?php
// Authentication Functions
session_start();

require_once 'db_connect.php';

// Register new user
function registerUser($username, $email, $password, $full_name, $profile_picture = 'apple.png') {
    global $conn;
    
    // Validate input
    if (empty($username) || empty($email) || empty($password) || empty($full_name)) {
        return ['success' => false, 'message' => 'All fields are required'];
    }
    
    // Check if username exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        return ['success' => false, 'message' => 'Username already exists'];
    }
    
    // Check if email exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        return ['success' => false, 'message' => 'Email already registered'];
    }
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert user
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, full_name, profile_picture) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $username, $email, $hashed_password, $full_name, $profile_picture);
    
    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'Registration successful!', 'user_id' => $conn->insert_id];
    } else {
        return ['success' => false, 'message' => 'Registration failed'];
    }
}

// Login user
function loginUser($username, $password) {
    global $conn;
    
    $stmt = $conn->prepare("SELECT id, username, email, password, full_name, profile_picture FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $username, $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return ['success' => false, 'message' => 'User not found'];
    }
    
    $user = $result->fetch_assoc();
    
    if (password_verify($password, $user['password'])) {
        // Update last login
        $update_stmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $update_stmt->bind_param("i", $user['id']);
        $update_stmt->execute();
        
        // Set session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['full_name'] = $user['full_name'];
        $_SESSION['profile_picture'] = $user['profile_picture'];
        
        return ['success' => true, 'message' => 'Login successful!', 'user' => $user];
    } else {
        return ['success' => false, 'message' => 'Invalid password'];
    }
}

// Check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Get current user info
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    global $conn;
    $user_id = $_SESSION['user_id'];
    
    $stmt = $conn->prepare("SELECT id, username, email, full_name, profile_picture, date_joined, total_quizzes FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_assoc();
}

// Logout user
function logoutUser() {
    session_unset();
    session_destroy();
    return ['success' => true, 'message' => 'Logged out successfully'];
}

// Update user profile
function updateUserProfile($user_id, $full_name, $email, $profile_picture) {
    global $conn;
    
    $stmt = $conn->prepare("UPDATE users SET full_name = ?, email = ?, profile_picture = ? WHERE id = ?");
    $stmt->bind_param("sssi", $full_name, $email, $profile_picture, $user_id);
    
    if ($stmt->execute()) {
        // Update session
        $_SESSION['full_name'] = $full_name;
        $_SESSION['profile_picture'] = $profile_picture;
        
        return ['success' => true, 'message' => 'Profile updated successfully'];
    } else {
        return ['success' => false, 'message' => 'Update failed'];
    }
}

// Change password
function changePassword($user_id, $old_password, $new_password) {
    global $conn;
    
    // Verify old password
    $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if (!password_verify($old_password, $user['password'])) {
        return ['success' => false, 'message' => 'Current password is incorrect'];
    }
    
    // Update password
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->bind_param("si", $hashed_password, $user_id);
    
    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'Password changed successfully'];
    } else {
        return ['success' => false, 'message' => 'Password change failed'];
    }
}
?>