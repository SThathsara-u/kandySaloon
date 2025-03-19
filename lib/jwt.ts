import jwt from 'jsonwebtoken';

export const verifyJwtToken = (token: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback_secret', 
      (err, decoded) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded);
      }
    );
  });
};
