# Quiz System

A web-based quiz application built with HTML, CSS, JavaScript, and PHP. This system allows users to take quizzes, track their progress, and manage their accounts with features like login, registration, and password reset.

## Features

- **User Authentication**
  - User registration and login
  - Password reset functionality
  - Secure session management
  - Logout capability

- **Quiz Functionality**
  - Interactive quiz interface
  - Multiple-choice questions
  - Real-time score tracking
  - Results display after completion

- **User Interface**
  - Responsive design
  - Navigation across multiple pages
  - Dynamic content loading
  - User-friendly interface

## Project Structure

```
quiz_system/
├── index.html              # Landing/home page
├── home.html              # User dashboard
├── login.html             # Login page
├── about.html             # About page
├── contact.html           # Contact page
├── quiz.html              # Quiz interface
├── results.html           # Quiz results page
├── forgot_password.html   # Password reset page
├── css/
│   └── style.css          # Main stylesheet
├── js/
│   ├── script.js          # Main JavaScript file
│   └── nav_handler.js     # Navigation handler
└── php/
    ├── login.php              # Login handler
    ├── logout.php             # Logout handler
    ├── reset_password.php     # Password reset handler
    └── check_login_status.php # Session verification
```

## Installation

### Prerequisites

- **XAMPP** (or any local server with PHP and MySQL)
- Modern web browser
- Text editor (VS Code recommended)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/WAD621S-2025/QUIZ_SYSTEM.git
   ```

2. **Move to XAMPP directory**
   - Copy the project folder to `C:\xampp\htdocs\` (Windows)
   - Or `/Applications/XAMPP/htdocs/` (Mac)

3. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start Apache server
   - Start MySQL server

4. **Set up the database**
   - Open phpMyAdmin (`http://localhost/phpmyadmin`)
   - Create a new database (e.g., `quiz_system`)
   - Import the SQL file if provided, or create necessary tables

5. **Configure database connection**
   - Update database credentials in PHP files if needed
   - Default credentials are usually:
     - Host: `localhost`
     - Username: `root`
     - Password: (empty)
     - Database: `quiz_system`

6. **Access the application**
   - Open browser and navigate to `http://localhost/quiz_system`

## Usage

### For Users

1. **Registration**
   - Navigate to the registration page
   - Fill in required details
   - Submit to create an account

2. **Login**
   - Go to login page
   - Enter username and password
   - Access your dashboard

3. **Taking a Quiz**
   - Navigate to quiz page from dashboard
   - Answer questions
   - Submit to see results

4. **Password Reset**
   - Click "Forgot Password" on login page
   - Follow instructions to reset password

### For Developers

1. **Adding New Questions**
   - Update the database with new questions
   - Ensure proper formatting in quiz.html

2. **Styling Changes**
   - Modify `css/style.css` for design updates
   - Use responsive design principles

3. **Adding Features**
   - Create new PHP handlers in `php/` directory
   - Add corresponding JavaScript in `js/` directory
   - Update navigation in `nav_handler.js`

## Technologies Used

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript (ES6+)

- **Backend:**
  - PHP 7.4+
  - MySQL

- **Server:**
  - Apache (via XAMPP)

## Database Schema

```sql
-- Example structure (adjust as needed)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question TEXT NOT NULL,
    option_a VARCHAR(255),
    option_b VARCHAR(255),
    option_c VARCHAR(255),
    option_d VARCHAR(255),
    correct_answer CHAR(1)
);

CREATE TABLE results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    score INT,
    total_questions INT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/YourFeature`)
6. Open a Pull Request

## Troubleshooting

### Common Issues

**Issue: Pages not loading**
- Solution: Ensure XAMPP Apache server is running
- Check if you're accessing via `localhost` not file path

**Issue: Database connection failed**
- Solution: Verify MySQL is running in XAMPP
- Check database credentials in PHP files

**Issue: Session not persisting**
- Solution: Ensure `session_start()` is at the top of PHP files
- Check browser cookies are enabled

**Issue: Git sync problems in VS Code**
- Solution: Use terminal commands: `git add .`, `git commit -m "message"`, `git push origin main`

## License

This project is created for educational purposes as part of WAD621S-2025 coursework.

## Contact

For questions or support, please visit the contact page or reach out through the course platform.

## Acknowledgments

- NUST WAD621S-2025 Course
- XAMPP Development Team
- All contributors to this project

---

**Version:** 1.0  
**Last Updated:** October 2025  
**Course:** WAD621S-2025