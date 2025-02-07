import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id, 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role // Make sure this is included
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};
