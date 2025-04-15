
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'eau_vigilance',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to access this resource' });
    }
    next();
  };
};

// Log activity
const logActivity = async (userId, actionType, resourceType, resourceId, details, ipAddress) => {
  try {
    await pool.query(
      'INSERT INTO activity_logs (id, user_id, action_type, resource_type, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), userId, actionType, resourceType, resourceId, details, ipAddress]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// ===== AUTH ROUTES =====

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user from database
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // In a real app, use bcrypt.compare to check password
    // const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    // For demo purposes, we'll just check if there's a user
    const isPasswordValid = true;
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Get user's site access
    const [siteAccess] = await pool.query(
      'SELECT site_id FROM site_access WHERE user_id = ?',
      [user.id]
    );
    
    const userSiteAccess = siteAccess.map(row => row.site_id);
    
    // Create and sign JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        siteAccess: userSiteAccess
      }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Log activity
    await logActivity(
      user.id, 
      'LOGIN', 
      'auth', 
      null, 
      'User logged in', 
      req.ip
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        siteAccess: userSiteAccess
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user route
app.get('/api/auth/user', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, avatar FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's site access
    const [siteAccess] = await pool.query(
      'SELECT site_id FROM site_access WHERE user_id = ?',
      [user.id]
    );
    
    const userSiteAccess = siteAccess.map(row => row.site_id);
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      siteAccess: userSiteAccess
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== MINING SITES ROUTES =====

// Get all mining sites
app.get('/api/sites', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM mining_sites';
    let params = [];
    
    // If not admin or director, only show sites they have access to
    if (!['admin', 'director'].includes(req.user.role)) {
      query = `
        SELECT ms.* FROM mining_sites ms
        JOIN site_access sa ON ms.id = sa.site_id
        WHERE sa.user_id = ?
      `;
      params = [req.user.id];
    }
    
    const [sites] = await pool.query(query, params);
    
    // For each site, get its thresholds
    for (const site of sites) {
      const [thresholds] = await pool.query(
        'SELECT parameter, min_value, max_value FROM thresholds WHERE site_id = ?',
        [site.id]
      );
      
      site.thresholds = thresholds.reduce((acc, threshold) => {
        acc[threshold.parameter] = {
          min: threshold.min_value,
          max: threshold.max_value
        };
        return acc;
      }, {});
    }
    
    res.json(sites);
  } catch (error) {
    console.error('Get sites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single mining site
app.get('/api/sites/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user has access to this site
    if (!['admin', 'director'].includes(req.user.role)) {
      const [access] = await pool.query(
        'SELECT 1 FROM site_access WHERE user_id = ? AND site_id = ?',
        [req.user.id, id]
      );
      
      if (access.length === 0) {
        return res.status(403).json({ message: 'You do not have access to this site' });
      }
    }
    
    const [sites] = await pool.query('SELECT * FROM mining_sites WHERE id = ?', [id]);
    
    if (sites.length === 0) {
      return res.status(404).json({ message: 'Site not found' });
    }
    
    const site = sites[0];
    
    // Get thresholds for the site
    const [thresholds] = await pool.query(
      'SELECT parameter, min_value, max_value FROM thresholds WHERE site_id = ?',
      [id]
    );
    
    site.thresholds = thresholds.reduce((acc, threshold) => {
      acc[threshold.parameter] = {
        min: threshold.min_value,
        max: threshold.max_value
      };
      return acc;
    }, {});
    
    res.json(site);
  } catch (error) {
    console.error('Get site error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== WATER QUALITY DATA ROUTES =====

// Get water quality data
app.get('/api/data', authenticateToken, async (req, res) => {
  try {
    const { site_id, status, start_date, end_date, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT wqd.*, ms.name as site_name, u.name as collector_name
      FROM water_quality_data wqd
      JOIN mining_sites ms ON wqd.site_id = ms.id
      JOIN users u ON wqd.collected_by = u.id
      WHERE 1=1
    `;
    let params = [];
    
    // Add filters
    if (site_id) {
      query += ' AND wqd.site_id = ?';
      params.push(site_id);
    } else if (!['admin', 'director'].includes(req.user.role)) {
      // If not admin or director, only show data from sites they have access to
      query += ` AND wqd.site_id IN (
        SELECT site_id FROM site_access WHERE user_id = ?
      )`;
      params.push(req.user.id);
    }
    
    if (status) {
      query += ' AND wqd.status = ?';
      params.push(status);
    }
    
    if (start_date) {
      query += ' AND wqd.timestamp >= ?';
      params.push(new Date(start_date));
    }
    
    if (end_date) {
      query += ' AND wqd.timestamp <= ?';
      params.push(new Date(end_date));
    }
    
    // Add sorting and pagination
    query += ' ORDER BY wqd.timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [data] = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM water_quality_data wqd
      WHERE 1=1
    `;
    let countParams = [];
    
    if (site_id) {
      countQuery += ' AND wqd.site_id = ?';
      countParams.push(site_id);
    } else if (!['admin', 'director'].includes(req.user.role)) {
      countQuery += ` AND wqd.site_id IN (
        SELECT site_id FROM site_access WHERE user_id = ?
      )`;
      countParams.push(req.user.id);
    }
    
    if (status) {
      countQuery += ' AND wqd.status = ?';
      countParams.push(status);
    }
    
    if (start_date) {
      countQuery += ' AND wqd.timestamp >= ?';
      countParams.push(new Date(start_date));
    }
    
    if (end_date) {
      countQuery += ' AND wqd.timestamp <= ?';
      countParams.push(new Date(end_date));
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      data,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get water quality data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new water quality data
app.post('/api/data', authenticateToken, async (req, res) => {
  try {
    const { 
      site_id, 
      timestamp,
      latitude,
      longitude,
      pH,
      temperature,
      dissolved_oxygen,
      conductivity,
      turbidity,
      notes
    } = req.body;
    
    // Check if user has access to this site
    if (!['admin', 'site_agent'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to add data' });
    }
    
    if (!['admin', 'director'].includes(req.user.role)) {
      const [access] = await pool.query(
        'SELECT 1 FROM site_access WHERE user_id = ? AND site_id = ?',
        [req.user.id, site_id]
      );
      
      if (access.length === 0) {
        return res.status(403).json({ message: 'You do not have access to this site' });
      }
    }
    
    // Get thresholds for this site
    const [thresholds] = await pool.query(
      'SELECT parameter, min_value, max_value FROM thresholds WHERE site_id = ?',
      [site_id]
    );
    
    const thresholdsMap = thresholds.reduce((acc, threshold) => {
      acc[threshold.parameter] = {
        min: threshold.min_value,
        max: threshold.max_value
      };
      return acc;
    }, {});
    
    // Determine status based on thresholds
    let status = 'normal';
    const checkParameter = (value, thresholdKey, thresholds) => {
      if (!thresholds[thresholdKey]) return 'normal';
      
      const min = thresholds[thresholdKey].min;
      const max = thresholds[thresholdKey].max;
      
      if ((min && value < min * 0.9) || (max && value > max * 1.1)) {
        return 'critical';
      } else if ((min && value < min) || (max && value > max)) {
        return 'warning';
      }
      return 'normal';
    };
    
    const pHStatus = checkParameter(pH, 'pH', thresholdsMap);
    const tempStatus = checkParameter(temperature, 'temperature', thresholdsMap);
    const doStatus = checkParameter(dissolved_oxygen, 'dissolved_oxygen', thresholdsMap);
    const condStatus = checkParameter(conductivity, 'conductivity', thresholdsMap);
    const turbStatus = checkParameter(turbidity, 'turbidity', thresholdsMap);
    
    if ([pHStatus, tempStatus, doStatus, condStatus, turbStatus].includes('critical')) {
      status = 'critical';
    } else if ([pHStatus, tempStatus, doStatus, condStatus, turbStatus].includes('warning')) {
      status = 'warning';
    }
    
    // Insert data
    const dataId = uuidv4();
    await pool.query(
      `INSERT INTO water_quality_data (
        id, site_id, collected_by, timestamp, latitude, longitude,
        pH, temperature, dissolved_oxygen, conductivity, turbidity,
        status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dataId, site_id, req.user.id, new Date(timestamp), latitude, longitude,
        pH, temperature, dissolved_oxygen, conductivity, turbidity,
        status, notes
      ]
    );
    
    // Create alerts if needed
    if (status !== 'normal') {
      const createAlert = async (type, parameter, value, threshold, severity) => {
        let message = '';
        
        switch (parameter) {
          case 'pH':
            message = `pH level ${value.toFixed(1)} is outside acceptable range`;
            if (threshold.min && threshold.max) {
              message += ` (${threshold.min}-${threshold.max})`;
            } else if (threshold.min) {
              message += ` (min: ${threshold.min})`;
            } else if (threshold.max) {
              message += ` (max: ${threshold.max})`;
            }
            break;
          case 'temperature':
            message = `Temperature ${value.toFixed(1)}°C is outside acceptable range`;
            if (threshold.min && threshold.max) {
              message += ` (${threshold.min}-${threshold.max}°C)`;
            } else if (threshold.min) {
              message += ` (min: ${threshold.min}°C)`;
            } else if (threshold.max) {
              message += ` (max: ${threshold.max}°C)`;
            }
            break;
          case 'dissolved_oxygen':
            message = `Dissolved oxygen ${value.toFixed(1)} mg/L is below minimum (${threshold.min} mg/L)`;
            break;
          case 'conductivity':
            message = `Conductivity ${value.toFixed(0)} μS/cm exceeds maximum (${threshold.max} μS/cm)`;
            break;
          case 'turbidity':
            message = `Turbidity ${value.toFixed(1)} NTU exceeds maximum (${threshold.max} NTU)`;
            break;
        }
        
        await pool.query(
          `INSERT INTO alerts (id, data_id, type, severity, message, created_at)
          VALUES (?, ?, ?, ?, ?, NOW())`,
          [uuidv4(), dataId, type, severity, message]
        );
      };
      
      if (pHStatus !== 'normal') {
        await createAlert('pH', 'pH', pH, thresholdsMap.pH, pHStatus);
      }
      
      if (tempStatus !== 'normal') {
        await createAlert('temperature', 'temperature', temperature, thresholdsMap.temperature, tempStatus);
      }
      
      if (doStatus !== 'normal') {
        await createAlert('dissolved_oxygen', 'dissolved_oxygen', dissolved_oxygen, thresholdsMap.dissolved_oxygen, doStatus);
      }
      
      if (condStatus !== 'normal') {
        await createAlert('conductivity', 'conductivity', conductivity, thresholdsMap.conductivity, condStatus);
      }
      
      if (turbStatus !== 'normal') {
        await createAlert('turbidity', 'turbidity', turbidity, thresholdsMap.turbidity, turbStatus);
      }
    }
    
    // Log activity
    await logActivity(
      req.user.id,
      'CREATE',
      'water_quality_data',
      dataId,
      `Added new water quality data for site ${site_id} with status ${status}`,
      req.ip
    );
    
    res.status(201).json({
      id: dataId,
      message: 'Water quality data added successfully',
      alerts_generated: status !== 'normal'
    });
  } catch (error) {
    console.error('Add water quality data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== ALERTS ROUTES =====

// Get alerts
app.get('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const { 
      site_id, 
      severity, 
      acknowledged,
      start_date,
      end_date,
      limit = 100, 
      offset = 0 
    } = req.query;
    
    let query = `
      SELECT a.*, wqd.site_id, ms.name as site_name, 
      u1.name as acknowledged_by_name
      FROM alerts a
      JOIN water_quality_data wqd ON a.data_id = wqd.id
      JOIN mining_sites ms ON wqd.site_id = ms.id
      LEFT JOIN users u1 ON a.acknowledged_by = u1.id
      WHERE 1=1
    `;
    let params = [];
    
    // Add filters
    if (site_id) {
      query += ' AND wqd.site_id = ?';
      params.push(site_id);
    } else if (!['admin', 'director'].includes(req.user.role)) {
      // If not admin or director, only show alerts from sites they have access to
      query += ` AND wqd.site_id IN (
        SELECT site_id FROM site_access WHERE user_id = ?
      )`;
      params.push(req.user.id);
    }
    
    if (severity) {
      query += ' AND a.severity = ?';
      params.push(severity);
    }
    
    if (acknowledged !== undefined) {
      query += ' AND a.acknowledged = ?';
      params.push(acknowledged === 'true' || acknowledged === '1');
    }
    
    if (start_date) {
      query += ' AND a.created_at >= ?';
      params.push(new Date(start_date));
    }
    
    if (end_date) {
      query += ' AND a.created_at <= ?';
      params.push(new Date(end_date));
    }
    
    // Add sorting and pagination
    query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [alerts] = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM alerts a
      JOIN water_quality_data wqd ON a.data_id = wqd.id
      WHERE 1=1
    `;
    let countParams = [];
    
    if (site_id) {
      countQuery += ' AND wqd.site_id = ?';
      countParams.push(site_id);
    } else if (!['admin', 'director'].includes(req.user.role)) {
      countQuery += ` AND wqd.site_id IN (
        SELECT site_id FROM site_access WHERE user_id = ?
      )`;
      countParams.push(req.user.id);
    }
    
    if (severity) {
      countQuery += ' AND a.severity = ?';
      countParams.push(severity);
    }
    
    if (acknowledged !== undefined) {
      countQuery += ' AND a.acknowledged = ?';
      countParams.push(acknowledged === 'true' || acknowledged === '1');
    }
    
    if (start_date) {
      countQuery += ' AND a.created_at >= ?';
      countParams.push(new Date(start_date));
    }
    
    if (end_date) {
      countQuery += ' AND a.created_at <= ?';
      countParams.push(new Date(end_date));
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      alerts,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Acknowledge alert
app.put('/api/alerts/:id/acknowledge', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if alert exists
    const [alerts] = await pool.query(`
      SELECT a.*, wqd.site_id
      FROM alerts a
      JOIN water_quality_data wqd ON a.data_id = wqd.id
      WHERE a.id = ?
    `, [id]);
    
    if (alerts.length === 0) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    const alert = alerts[0];
    
    // Check if alert is already acknowledged
    if (alert.acknowledged) {
      return res.status(400).json({ message: 'Alert is already acknowledged' });
    }
    
    // Check if user has access to this site
    if (!['admin', 'director'].includes(req.user.role)) {
      const [access] = await pool.query(
        'SELECT 1 FROM site_access WHERE user_id = ? AND site_id = ?',
        [req.user.id, alert.site_id]
      );
      
      if (access.length === 0) {
        return res.status(403).json({ message: 'You do not have access to this alert' });
      }
    }
    
    // Acknowledge alert
    await pool.query(
      'UPDATE alerts SET acknowledged = TRUE, acknowledged_by = ?, acknowledged_at = NOW() WHERE id = ?',
      [req.user.id, id]
    );
    
    // Log activity
    await logActivity(
      req.user.id,
      'ACKNOWLEDGE',
      'alerts',
      id,
      'Acknowledged alert',
      req.ip
    );
    
    res.json({ message: 'Alert acknowledged successfully' });
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
