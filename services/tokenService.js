export const generateToken = (user) => {
  return jwt.sign(
    {
      userid: user._id, 
      email: user.email,
      firstName: user.firstName,  // Add firstName
      lastName: user.lastName,    // Add lastName
      phoneNumber: user.phoneNumber  // Add phoneNumber
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};
