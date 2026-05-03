const bcrypt = require("bcrypt");
const db = require("../../config/db");
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const register = async (name, email, password) => {
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) {
    throw new AppError('Email already exists', 409);
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const query = `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'buyer') RETURNING id, name, email, role`;
  const result = await db.query(query, [name, email, hashedPassword]);
  return result.rows[0];
};

const login = async (email, password) => {
  const query = `SELECT id, role, password_hash, email, name FROM users WHERE email = $1`;
  const result = await db.query(query, [email]);
  if (!result.rows.length) {
    throw new AppError('Invalid email or password', 401);
  }
  const user = result.rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }
  const payload = {
    id: user.id,
    role: user.role
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};
module.exports = { register, login };