
# Eau Vigilance Platform - Backend Implementation Guide

This document outlines the backend implementation for the Eau Vigilance Platform, a water quality monitoring system for mining sites.

## Database Schema (MySQL)

The following tables should be created in your MySQL database:

### 1. Users Table

```sql
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
```

### 2. Mining Sites Table

```sql
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
```

### 3. Site Access Table (Many-to-Many Relationship)

```sql
CREATE TABLE site_access (
  user_id VARCHAR(36) NOT NULL,
  site_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (user_id, site_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (site_id) REFERENCES mining_sites(id) ON DELETE CASCADE
);
```

### 4. Thresholds Table

```sql
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
```

### 5. Water Quality Data Table

```sql
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
```

### 6. Alerts Table

```sql
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
```

### 7. PGES Plans Table

```sql
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
```

### 8. Activity Log Table

```sql
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
```

## API Endpoints

The following RESTful API endpoints should be implemented:

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current authenticated user info

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a user by ID
- `POST /api/users` - Create a new user (admin only)
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user (admin only)

### Mining Sites

- `GET /api/sites` - Get all mining sites
- `GET /api/sites/:id` - Get a mining site by ID
- `POST /api/sites` - Create a new mining site (admin only)
- `PUT /api/sites/:id` - Update a mining site (admin only)
- `DELETE /api/sites/:id` - Delete a mining site (admin only)
- `GET /api/sites/:id/thresholds` - Get thresholds for a site
- `PUT /api/sites/:id/thresholds` - Update thresholds for a site

### Water Quality Data

- `GET /api/data` - Get all water quality data (with filtering options)
- `GET /api/data/:id` - Get water quality data by ID
- `POST /api/data` - Submit new water quality data
- `PUT /api/data/:id` - Update water quality data
- `DELETE /api/data/:id` - Delete water quality data (admin only)
- `GET /api/data/stats` - Get statistical data

### Alerts

- `GET /api/alerts` - Get all alerts (with filtering options)
- `GET /api/alerts/:id` - Get an alert by ID
- `PUT /api/alerts/:id/acknowledge` - Acknowledge an alert
- `GET /api/alerts/summary` - Get alerts summary (counts by severity/status)

### PGES Plans

- `GET /api/pges` - Get all PGES plans
- `GET /api/pges/:id` - Get a PGES plan by ID
- `POST /api/pges` - Create a new PGES plan
- `PUT /api/pges/:id` - Update a PGES plan
- `DELETE /api/pges/:id` - Delete a PGES plan
- `GET /api/pges/:id/download` - Download PGES document

## Implementation Notes

### 1. Authentication & Authorization

- Use JWT (JSON Web Tokens) for authentication
- Implement role-based access control
- Store user passwords securely with bcrypt or similar hashing

### 2. Real-time Data Processing

- Implement data validation on backend before storage
- Automatically calculate status (normal/warning/critical) based on thresholds
- Generate alerts when thresholds are exceeded

### 3. Real-time Notifications

- Implement websocket connections for real-time updates
- Send email notifications for critical alerts
- Create a notification queue system for reliability

### 4. Data Security

- Implement HTTPS for all API endpoints
- Add rate limiting to prevent abuse
- Validate and sanitize all input data
- Implement proper error handling and logging

### 5. Integration Points

- Data collection devices can integrate via API
- Create an upload endpoint for CSV/Excel data imports
- Implement data export functionality for reports

## Technology Stack Recommendations

- **Backend Framework**: Node.js with Express or NestJS
- **Database**: MySQL (as specified in requirements)
- **Authentication**: Passport.js with JWT strategy
- **Real-time**: Socket.io for websocket connections
- **Validation**: Joi or class-validator
- **ORM**: Sequelize or TypeORM for database interactions
- **Documentation**: Swagger/OpenAPI for API documentation
- **Testing**: Jest for unit and integration tests
- **Deployment**: Docker containers for consistent environments

## Getting Started

1. Set up a MySQL database with the schema provided above
2. Implement the backend API using your preferred technology stack
3. Create seed data for testing
4. Implement user authentication and authorization
5. Connect the frontend to the backend API endpoints
6. Test all functionality end-to-end
7. Deploy to a production environment
