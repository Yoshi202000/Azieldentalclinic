import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id, 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : null, // Format DOB as YYYY-MM-DD
      clinic: user.clinic,
      doctorGreeting: user.doctorGreeting,
      doctorDescription: user.doctorDescription,
      services: user.services,
      doctorImage: user.doctorImage
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};
