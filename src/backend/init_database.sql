
-- Initialize Eau Vigilance Platform Database
-- This script creates all necessary tables and populates them with sample data

-- Drop tables if they exist to avoid conflicts
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS water_quality_data;
DROP TABLE IF EXISTS thresholds;
DROP TABLE IF EXISTS pges_plans;
DROP TABLE IF EXISTS site_access;
DROP TABLE IF EXISTS mining_sites;
DROP TABLE IF EXISTS users;

-- Create Users Table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'site_agent', 'external_supervisor', 'internal_supervisor', 'director', 'professor') NOT NULL,
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Mining Sites Table
CREATE TABLE mining_sites (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  active_monitoring BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Site Access Table (Many-to-Many Relationship)
CREATE TABLE site_access (
  user_id VARCHAR(36) NOT NULL,
  site_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (user_id, site_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (site_id) REFERENCES mining_sites(id) ON DELETE CASCADE
);

-- Create Thresholds Table
CREATE TABLE thresholds (
  id VARCHAR(36) PRIMARY KEY,
  site_id VARCHAR(36) NOT NULL,
  parameter VARCHAR(50) NOT NULL,
  min_value DECIMAL(10, 2),
  max_value DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES mining_sites(id) ON DELETE CASCADE,
  UNIQUE KEY (site_id, parameter)
);

-- Create Water Quality Data Table
CREATE TABLE water_quality_data (
  id VARCHAR(36) PRIMARY KEY,
  site_id VARCHAR(36) NOT NULL,
  collected_by VARCHAR(36) NOT NULL,
  timestamp DATETIME NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  pH DECIMAL(5, 2),
  temperature DECIMAL(5, 2),
  dissolved_oxygen DECIMAL(5, 2),
  conductivity DECIMAL(10, 2),
  turbidity DECIMAL(5, 2),
  status ENUM('normal', 'warning', 'critical') NOT NULL DEFAULT 'normal',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES mining_sites(id) ON DELETE CASCADE,
  FOREIGN KEY (collected_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Alerts Table
CREATE TABLE alerts (
  id VARCHAR(36) PRIMARY KEY,
  data_id VARCHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  severity ENUM('low', 'medium', 'high') NOT NULL,
  message TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by VARCHAR(36),
  acknowledged_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (data_id) REFERENCES water_quality_data(id) ON DELETE CASCADE,
  FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create PGES Plans Table
CREATE TABLE pges_plans (
  id VARCHAR(36) PRIMARY KEY,
  site_id VARCHAR(36) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  file_path VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(36) NOT NULL,
  approved_by VARCHAR(36),
  effective_date DATE,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES mining_sites(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create Activity Log Table
CREATE TABLE activity_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  action_type VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(36),
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert Sample Users
-- Note: In a real system, password_hash would be properly hashed
INSERT INTO users (id, name, email, password_hash, role) VALUES
('user-1', 'Admin User', 'admin@eau-vigilance.com', '$2a$10$XuG4wqiHGFbGC0Yo9WvrxeIFCaAYIQCWL1eTcPTxZQGBEXiK.hWEm', 'admin'),
('user-2', 'Site Agent', 'agent@eau-vigilance.com', '$2a$10$XuG4wqiHGFbGC0Yo9WvrxeIFCaAYIQCWL1eTcPTxZQGBEXiK.hWEm', 'site_agent'),
('user-3', 'External Supervisor', 'external@eau-vigilance.com', '$2a$10$XuG4wqiHGFbGC0Yo9WvrxeIFCaAYIQCWL1eTcPTxZQGBEXiK.hWEm', 'external_supervisor'),
('user-4', 'Internal Supervisor', 'internal@eau-vigilance.com', '$2a$10$XuG4wqiHGFbGC0Yo9WvrxeIFCaAYIQCWL1eTcPTxZQGBEXiK.hWEm', 'internal_supervisor'),
('user-5', 'Director DREEC', 'director@eau-vigilance.com', '$2a$10$XuG4wqiHGFbGC0Yo9WvrxeIFCaAYIQCWL1eTcPTxZQGBEXiK.hWEm', 'director'),
('user-6', 'Professor DGAE', 'professor@eau-vigilance.com', '$2a$10$XuG4wqiHGFbGC0Yo9WvrxeIFCaAYIQCWL1eTcPTxZQGBEXiK.hWEm', 'professor');

-- Insert Sample Mining Sites
INSERT INTO mining_sites (id, name, description, latitude, longitude, active_monitoring) VALUES
('site-1', 'Kédougou Gold Mine', 'Main gold mining operation in Kédougou region', 12.5503, -12.1726, TRUE),
('site-2', 'Tambacounda Mine', 'Secondary mining site with mixed ore extraction', 13.7702, -13.6672, TRUE),
('site-3', 'Saraya Extraction Site', 'Newer extraction operation focusing on sustainable practices', 12.8421, -11.7864, FALSE);

-- Set up site access permissions
INSERT INTO site_access (user_id, site_id) VALUES
('user-1', 'site-1'), ('user-1', 'site-2'), ('user-1', 'site-3'), -- Admin has access to all sites
('user-2', 'site-1'), -- Site agent has access to site 1
('user-3', 'site-1'), ('user-3', 'site-2'), -- External supervisor has access to sites 1 and 2
('user-4', 'site-1'), ('user-4', 'site-2'), ('user-4', 'site-3'), -- Internal supervisor has access to all sites
('user-5', 'site-1'), ('user-5', 'site-2'), ('user-5', 'site-3'), -- Director has access to all sites
('user-6', 'site-1'), ('user-6', 'site-2'); -- Professor has access to sites 1 and 2

-- Insert thresholds for each site
-- Site 1 Thresholds
INSERT INTO thresholds (id, site_id, parameter, min_value, max_value) VALUES
(UUID(), 'site-1', 'pH', 6.5, 8.5),
(UUID(), 'site-1', 'temperature', 10, 30),
(UUID(), 'site-1', 'dissolved_oxygen', 5, NULL),
(UUID(), 'site-1', 'conductivity', NULL, 800),
(UUID(), 'site-1', 'turbidity', NULL, 5);

-- Site 2 Thresholds
INSERT INTO thresholds (id, site_id, parameter, min_value, max_value) VALUES
(UUID(), 'site-2', 'pH', 6.5, 8.5),
(UUID(), 'site-2', 'temperature', 10, 30),
(UUID(), 'site-2', 'dissolved_oxygen', 5, NULL),
(UUID(), 'site-2', 'conductivity', NULL, 800),
(UUID(), 'site-2', 'turbidity', NULL, 5);

-- Site 3 Thresholds
INSERT INTO thresholds (id, site_id, parameter, min_value, max_value) VALUES
(UUID(), 'site-3', 'pH', 6.5, 8.5),
(UUID(), 'site-3', 'temperature', 10, 30),
(UUID(), 'site-3', 'dissolved_oxygen', 5, NULL),
(UUID(), 'site-3', 'conductivity', NULL, 800),
(UUID(), 'site-3', 'turbidity', NULL, 5);

-- Insert sample PGES plans
INSERT INTO pges_plans (id, site_id, title, description, file_path, active, created_by, approved_by, effective_date, expiry_date) VALUES
(UUID(), 'site-1', 'Kédougou Gold Mine PGES 2025', 'Annual environmental management plan for Kédougou operations', '/files/pges/kedougou_2025.pdf', TRUE, 'user-3', 'user-5', '2025-01-01', '2026-01-01'),
(UUID(), 'site-2', 'Tambacounda Mine PGES 2025', 'Annual environmental management plan for Tambacounda operations', '/files/pges/tambacounda_2025.pdf', TRUE, 'user-3', 'user-5', '2025-01-01', '2026-01-01'),
(UUID(), 'site-3', 'Saraya Extraction PGES 2025', 'Environmental management plan for new Saraya site', '/files/pges/saraya_2025.pdf', TRUE, 'user-4', NULL, '2025-01-01', '2026-01-01');

-- Insert some sample water quality data and corresponding alerts would be done via application logic
-- In a real implementation, more sample data would be added here

-- Add sample activity logs
INSERT INTO activity_logs (id, user_id, action_type, resource_type, resource_id, details, ip_address) VALUES
(UUID(), 'user-1', 'CREATE', 'mining_sites', 'site-3', 'Created new mining site: Saraya Extraction Site', '192.168.1.1'),
(UUID(), 'user-2', 'DATA_COLLECTION', 'water_quality_data', NULL, 'Collected 5 new water quality samples at Kédougou site', '192.168.1.2'),
(UUID(), 'user-5', 'APPROVE', 'pges_plans', NULL, 'Approved PGES plans for Kédougou and Tambacounda sites', '192.168.1.5');
