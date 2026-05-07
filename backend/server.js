require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');

const telegramLogins = new Map();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('CRUX Backend API is running!');
});

// Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user into DB
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, passwordHash]
    );

    res.status(201).json({ message: 'User created successfully', user: newUser.rows[0] });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      message: 'Login successful', 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        platforms: user.platforms 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Onboarding Route
app.post('/api/onboarding', async (req, res) => {
  try {
    const { email, platforms, primaryPurpose, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await pool.query(
      'UPDATE users SET platforms = $1, primary_purpose = $2, role = $3 WHERE email = $4',
      [platforms, primaryPurpose, role, email]
    );

    res.json({ message: 'Onboarding data saved successfully' });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Telegram MTProto Flow
app.post('/api/telegram/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: 'Phone number is required' });

    const apiId = parseInt(process.env.TELEGRAM_API_ID);
    const apiHash = process.env.TELEGRAM_API_HASH;

    if (!apiId || !apiHash) {
      return res.status(500).json({ error: 'Telegram API credentials not configured' });
    }

    const stringSession = new StringSession('');
    const client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    });

    await client.connect();

    const { phoneCodeHash } = await client.sendCode(
      { apiId, apiHash },
      phoneNumber
    );

    telegramLogins.set(phoneNumber, { client, phoneCodeHash });

    res.json({ message: 'OTP sent successfully', phoneCodeHash });
  } catch (error) {
    console.error('Telegram send code error:', error);
    res.status(500).json({ error: error.message || 'Failed to send OTP' });
  }
});

app.post('/api/telegram/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otpCode, email } = req.body;
    if (!phoneNumber || !otpCode || !email) return res.status(400).json({ error: 'Phone number, OTP, and email are required' });

    const loginData = telegramLogins.get(phoneNumber);
    if (!loginData) {
      return res.status(400).json({ error: 'Session expired or not found. Please request a new OTP.' });
    }

    const { client, phoneCodeHash } = loginData;

    try {
      await client.invoke(
        new Api.auth.SignIn({
          phoneNumber,
          phoneCodeHash,
          phoneCode: otpCode,
        })
      );
    } catch (signInError) {
      if (signInError.message && signInError.message.includes('SESSION_PASSWORD_NEEDED')) {
        return res.status(401).json({ error: 'SESSION_PASSWORD_NEEDED', needs_password: true });
      } else {
        throw signInError;
      }
    }

    const sessionString = client.session.save();
    telegramLogins.delete(phoneNumber);
    
    // Save to DB
    await pool.query('UPDATE users SET telegram_session = $1 WHERE email = $2', [sessionString, email]);

    res.json({ message: 'Successfully connected to Telegram!', sessionString });
  } catch (error) {
    console.error('Telegram verify OTP error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify OTP' });
  }
});

app.post('/api/telegram/verify-password', async (req, res) => {
  try {
    const { phoneNumber, password, email } = req.body;
    if (!phoneNumber || !password || !email) return res.status(400).json({ error: 'Phone number, password, and email are required' });

    const loginData = telegramLogins.get(phoneNumber);
    if (!loginData) {
      return res.status(400).json({ error: 'Session expired or not found. Please start over.' });
    }

    const { client } = loginData;
    
    const apiId = parseInt(process.env.TELEGRAM_API_ID);
    const apiHash = process.env.TELEGRAM_API_HASH;
    
    await client.signInWithPassword(
      { apiId, apiHash },
      {
        password: async () => password,
        onError: (err) => { throw err; }
      }
    );

    const sessionString = client.session.save();
    telegramLogins.delete(phoneNumber);

    // Save to DB
    await pool.query('UPDATE users SET telegram_session = $1 WHERE email = $2', [sessionString, email]);

    res.json({ message: 'Successfully connected to Telegram with 2FA!', sessionString });
  } catch (error) {
    console.error('Telegram verify password error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify password' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
