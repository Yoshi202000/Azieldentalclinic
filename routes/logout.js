import express from 'express';

const router = express.Router();

// Logout route - clears the token from cookies
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Ensure secure flag is set in production
    sameSite: 'Strict', // SameSite policy to prevent CSRF
  });
  return res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
