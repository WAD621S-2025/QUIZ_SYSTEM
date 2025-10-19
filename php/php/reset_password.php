<?php
require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $usernameOrEmail = $_POST['username_or_email'] ?? '';
    $newPassword = $_POST['new_password'] ?? '';

    if (empty($usernameOrEmail) || empty($newPassword)) {
        die("Username/email and new password are required.");
    }

    // Hash the new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update password in the database
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE username = ? OR email = ?");
    $stmt->bind_param("sss", $hashedPassword, $usernameOrEmail, $usernameOrEmail);

    if ($stmt->execute()) {
        // Redirect to login page after successful reset
        header("Location: login.html?reset=success");
        exit;
    } else {
        die("Failed to reset password. Please try again.");
    }

}
?>

