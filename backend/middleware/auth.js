const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  // Try JWT first, then Google if it fails
  jwt.verify(token, process.env.JWT_SECRET || 'devsecret', async (err, user) => {
    if (!err) {
      req.user = user; // Contains: id, email, role, restaurantId
      return next();
    }

    // Try Google verification if JWT fails
    try {
      if (process.env.GOOGLE_CLIENT_ID) {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        req.user = {
          id: payload.sub,
          email: payload.email,
          role: 'user',
          restaurantId: null
        };
        return next();
      }
      return res.status(403).json({ message: 'Invalid token' });
    } catch (gErr) {
      return res.status(403).json({ message: 'Invalid token' });
    }
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin
};
