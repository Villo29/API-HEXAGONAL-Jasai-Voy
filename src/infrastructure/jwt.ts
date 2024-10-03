import jwt from 'jsonwebtoken';

// Lanzar un error si JWT_SECRET no está definido
const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

export const generateToken = (payload: object) => {
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, secret);
};
