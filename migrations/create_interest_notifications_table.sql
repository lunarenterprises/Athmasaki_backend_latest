-- SQL Script to create interest_notifications table
-- Run this in your MySQL database before using the interest notification feature

CREATE TABLE IF NOT EXISTS interest_notifications (
    in_id INT AUTO_INCREMENT PRIMARY KEY,
    in_from_user_id INT NOT NULL,
    in_to_user_id INT NOT NULL,
    in_type ENUM('interest_sent', 'interest_accepted') NOT NULL,
    in_is_notification_read BOOLEAN DEFAULT TRUE COMMENT 'TRUE = unread/new, FALSE = read/viewed',
    in_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_to_user (in_to_user_id),
    INDEX idx_read_status (in_to_user_id, in_is_notification_read),
    FOREIGN KEY (in_from_user_id) REFERENCES users(u_id) ON DELETE CASCADE,
    FOREIGN KEY (in_to_user_id) REFERENCES users(u_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
