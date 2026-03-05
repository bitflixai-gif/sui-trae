import { pool } from '../db/pool.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthService {
  async login(input: z.infer<typeof loginSchema>) {
    const { email, password } = loginSchema.parse(input);

    const res = await pool.query(
      `select id, password_hash, role from users where email = $1`,
      [email]
    );

    const user = res.rows[0];
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const valid = await argon2.verify(user.password_hash, password);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return { token, userId: user.id, role: user.role };
  }
}
