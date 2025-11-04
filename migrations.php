<?php
/**
 * Database Migrations
 * Run this script once to create all required tables
 */

// DB Configuration
$servername = "localhost";
$username   = "mazaoplu_ziraweb";
$password   = "Sirgeorge.12";
$dbname     = "mazaoplu_ziraweb";

// Connect to database
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$errors = [];
$success = [];

// Helper function to execute migration
function runMigration($conn, $name, $sql) {
    global $errors, $success;
    if ($conn->query($sql)) {
        $success[] = "✓ $name";
        echo "✓ $name<br>";
    } else {
        $errors[] = "$name: " . $conn->error;
        echo "✗ $name: " . $conn->error . "<br>";
    }
}

echo "<h2>Running Database Migrations...</h2><hr>";

// 1. Users table
runMigration($conn, "Create users table", "
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

// 2. Profiles table
runMigration($conn, "Create profiles table", "
    CREATE TABLE IF NOT EXISTS profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        full_name VARCHAR(255),
        company_email VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_id (user_id),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

// 3. User Roles table
runMigration($conn, "Create user_roles table", "
    CREATE TABLE IF NOT EXISTS user_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_role (user_id),
        INDEX idx_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

// 4. Activity Logs table
runMigration($conn, "Create activity_logs table", "
    CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255),
        description TEXT,
        table_name VARCHAR(255),
        record_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

// 5. Blog Categories table
runMigration($conn, "Create blog_categories table", "
    CREATE TABLE IF NOT EXISTS blog_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

// 6. Blog Posts table
runMigration($conn, "Create blog_posts table", "
    CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content LONGTEXT,
        excerpt TEXT,
        category_id INT,
        author_id INT,
        status VARCHAR(50) DEFAULT 'draft',
        featured_image_url VARCHAR(500),
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        published_at TIMESTAMP NULL,
        FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_slug (slug),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        FULLTEXT INDEX ft_content (title, content, excerpt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

// 7. Products table
runMigration($conn, "Create products table", "
    CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2),
        image_url VARCHAR(500),
        category VARCHAR(100),
        is_featured BOOLEAN DEFAULT FALSE,
        featured_order INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_is_featured (is_featured),
        INDEX idx_featured_order (featured_order),
        INDEX idx_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

// 8. Form Submissions table
runMigration($conn, "Create form_submissions table", "
    CREATE TABLE IF NOT EXISTS form_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        form_type VARCHAR(100),
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        message TEXT,
        status VARCHAR(50) DEFAULT 'new',
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_form_type (form_type),
        INDEX idx_status (status),
        INDEX idx_email (email),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

// 9. Company Settings table
runMigration($conn, "Create company_settings table", "
    CREATE TABLE IF NOT EXISTS company_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_setting_key (setting_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

$conn->close();

echo "<hr>";
echo "<h3>Summary</h3>";
echo count($success) . " migrations successful<br>";
if (!empty($errors)) {
    echo count($errors) . " migrations failed:<br>";
    foreach ($errors as $error) {
        echo "- $error<br>";
    }
} else {
    echo "All migrations completed successfully!<br>";
}
?>
