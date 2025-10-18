<?php
// Database configuration
$host = '127.0.0.1';       // Database host
$port = '3307';            // Port number for XAMPP MySQL
$dbname = 'quiz_system';   // Database name
$username = 'root';        // MySQL username
$password = '';            // MySQL password (empty for XAMPP default)

// Create connection
try {
    $conn = new mysqli($host, $username, $password, $dbname, $port);
    
    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    // Set charset to utf8mb4 for proper character support
    $conn->set_charset("utf8mb4");
    
} catch (Exception $e) {
    die("Database connection error: " . $e->getMessage());
}
?>