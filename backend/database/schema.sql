-- =====================================================
-- MedAssist AI – Database Schema
-- Run this script against your MySQL server to create
-- the medassist_db database and all required tables.
-- =====================================================

CREATE DATABASE IF NOT EXISTS medassist_db;
USE medassist_db;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100),
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('user','admin') DEFAULT 'user',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Diseases
CREATE TABLE IF NOT EXISTS diseases (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    category    VARCHAR(50),
    description TEXT
) ENGINE=InnoDB;

-- 3. Symptoms
CREATE TABLE IF NOT EXISTS symptoms (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(100) UNIQUE NOT NULL,
    aliases TEXT
) ENGINE=InnoDB;

-- 4. Disease ↔ Symptom mapping
CREATE TABLE IF NOT EXISTS disease_symptoms (
    disease_id INT,
    symptom_id INT,
    weight     FLOAT DEFAULT 1.0,
    PRIMARY KEY (disease_id, symptom_id),
    FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE,
    FOREIGN KEY (symptom_id) REFERENCES symptoms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Red-flag rules
CREATE TABLE IF NOT EXISTS red_flag_rules (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100),
    symptom_combo JSON,
    category      VARCHAR(50),
    risk_level    ENUM('HIGH','URGENT','EMERGENCY') DEFAULT 'HIGH',
    message       TEXT
) ENGINE=InnoDB;

-- 6. Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    disease_id     INT,
    lab_tests      TEXT,
    specialist     VARCHAR(100),
    lifestyle_tips TEXT,
    FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Predictions (user history)
CREATE TABLE IF NOT EXISTS predictions (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT,
    raw_input     TEXT,
    extracted_kw  JSON,
    top_diseases  JSON,
    risk_level    VARCHAR(20),
    red_flags     JSON,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Admin audit logs
CREATE TABLE IF NOT EXISTS admin_logs (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    admin_id   INT,
    action     VARCHAR(255),
    details    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
