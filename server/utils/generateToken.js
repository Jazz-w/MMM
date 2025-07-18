const jwt = require("jsonwebtoken");

const generateToken = (userId, isAdmin = false) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables!');
    throw new Error('JWT_SECRET is not configured');
  }
  console.log('Generating token with secret length:', process.env.JWT_SECRET.length);
  
  return jwt.sign(
    {
      id: userId,
      isAdmin: isAdmin,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET,
    { expiresIn: "5d" }
  );
};

module.exports = generateToken;
