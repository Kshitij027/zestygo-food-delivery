const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

// REGISTER — supports role + adminCode
router.post('/register', async (req, res) => {
  const { name, email, password, role, adminCode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    // Check if user exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      if (row) return res.status(400).json({ message: 'Email already registered' });

      const hashedPassword = await bcrypt.hash(password, 10);
      let userRole = 'user';
      let restaurantId = null;

      // If registering as admin, validate the admin code
      if (role === 'admin') {
        if (!adminCode) {
          return res.status(400).json({ message: 'Admin code is required for restaurant owners' });
        }

        // Wrap in a promise to handle the async DB lookup
        db.get('SELECT id, name FROM restaurants WHERE admin_code = ?', [adminCode], (codeErr, restaurant) => {
          if (codeErr) return res.status(500).json({ message: 'Database error', error: codeErr });
          if (!restaurant) return res.status(400).json({ message: 'Invalid admin code' });

          userRole = 'admin';
          restaurantId = restaurant.id;

          // Insert admin user
          db.run(
            'INSERT INTO users (name, email, password, role, restaurant_id) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, userRole, restaurantId],
            function (insertErr) {
              if (insertErr) return res.status(500).json({ message: 'Database error', error: insertErr });

              // Update restaurant owner_email
              db.run('UPDATE restaurants SET owner_email = ? WHERE id = ?', [email, restaurantId]);

              const token = jwt.sign(
                { id: this.lastID, email, role: userRole, restaurantId },
                process.env.JWT_SECRET || 'devsecret',
                { expiresIn: '7d' }
              );

              res.status(201).json({
                token,
                user: { id: this.lastID, name, email, role: userRole, restaurantId, restaurantName: restaurant.name }
              });
            }
          );
        });
        return; // Exit early; DB callback handles the response
      }

      // Normal user registration
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, userRole],
        function (insertErr) {
          if (insertErr) return res.status(500).json({ message: 'Database error', error: insertErr });

          const token = jwt.sign(
            { id: this.lastID, email, role: userRole },
            process.env.JWT_SECRET || 'devsecret',
            { expiresIn: '7d' }
          );

          res.status(201).json({
            token,
            user: { id: this.lastID, name, email, role: userRole }
          });
        }
      );
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e });
  }
});

// LOGIN — returns restaurantId for admins
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  db.get('SELECT u.*, r.name AS restaurant_name FROM users u LEFT JOIN restaurants r ON u.restaurant_id = r.id WHERE u.email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const safeRole = user.role || 'user';

    const token = jwt.sign(
      { id: user.id, email: user.email, role: safeRole, restaurantId: user.restaurant_id || null },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        role: safeRole, restaurantId: user.restaurant_id || null,
        restaurantName: user.restaurant_name || null
      }
    });
  });
});

// Google Sync
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google-sync', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Credential is required' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture: avatar } = payload;

    db.get('SELECT u.*, r.name AS restaurant_name FROM users u LEFT JOIN restaurants r ON u.restaurant_id = r.id WHERE u.email = ?', [email], (err, user) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });

      if (user) {
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role || 'user', restaurantId: user.restaurant_id || null },
          process.env.JWT_SECRET || 'devsecret',
          { expiresIn: '7d' }
        );
        return res.json({
          token,
          user: {
            id: user.id, name: user.name, email: user.email,
            role: user.role || 'user', avatar: user.avatar || avatar,
            restaurantId: user.restaurant_id || null,
            restaurantName: user.restaurant_name || null
          }
        });
      } else {
        db.run(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [name, email, 'google_auth_no_password', 'user'],
          function (insertErr) {
            if (insertErr) return res.status(500).json({ message: 'Database error', error: insertErr });

            const token = jwt.sign(
              { id: this.lastID, email, role: 'user' },
              process.env.JWT_SECRET || 'devsecret',
              { expiresIn: '7d' }
            );

            res.status(201).json({
              token,
              user: { id: this.lastID, name, email, role: 'user', avatar }
            });
          }
        );
      }
    });
  } catch (err) {
    console.error('Google token verification failed:', err);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

module.exports = router;