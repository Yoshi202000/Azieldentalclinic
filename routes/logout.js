import express from 'express';

const router = express.Router();

// Logout route - clears the token from cookies and local storage
router.post('/logout', (req, res) => {
  // Clear the token cookie (HTTP-only)
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/', // Ensure the path matches where the cookie was set
  });

  // Clear additional front-end cookies if they exist
  res.clearCookie('frontendToken', { path: '/' });
  res.clearCookie('userPreferences', { path: '/' });

  // Send a response with instructions to clear local storage on the client side
  res.status(200).json({ 
    message: 'Logged out successfully',
    clearLocalStorage: true,
  });
});

export default router;
