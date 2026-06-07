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
        platforms: user.platforms,
        hasTelegram: !!user.telegram_session
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

// =============================================
// TELEGRAM MTProto AUTHENTICATION FLOW
// =============================================

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

// =============================================
// TELEGRAM DATA RETRIEVAL ENDPOINTS
// =============================================

// Helper: Create a Telegram client from stored session
async function getTelegramClient(email) {
  const result = await pool.query('SELECT telegram_session FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0 || !result.rows[0].telegram_session) {
    return null;
  }

  const apiId = parseInt(process.env.TELEGRAM_API_ID);
  const apiHash = process.env.TELEGRAM_API_HASH;
  const sessionString = result.rows[0].telegram_session;

  const client = new TelegramClient(
    new StringSession(sessionString),
    apiId,
    apiHash,
    { connectionRetries: 5 }
  );

  await client.connect();
  return client;
}

// Helper: Get date range for a period
function getDateRange(period) {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'yesterday':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      now.setHours(0, 0, 0, 0); // end of yesterday = start of today
      break;
    case 'week':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  return { startDate, endDate: period === 'yesterday' ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) : new Date() };
}

// GET /api/telegram/status — Check Telegram connection status
app.get('/api/telegram/status', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const result = await pool.query('SELECT telegram_session FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0 || !result.rows[0].telegram_session) {
      return res.json({ connected: false });
    }

    // Try connecting to verify the session is still valid
    try {
      const client = await getTelegramClient(email);
      if (!client) {
        return res.json({ connected: false });
      }
      
      const me = await client.getMe();
      await client.disconnect();
      
      res.json({ 
        connected: true, 
        user: {
          firstName: me.firstName,
          lastName: me.lastName,
          username: me.username,
          phone: me.phone
        }
      });
    } catch (e) {
      console.error('Session validation failed:', e.message);
      res.json({ connected: false, error: 'Session expired' });
    }
  } catch (error) {
    console.error('Telegram status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/telegram/dialogs — Fetch all Telegram chats
app.get('/api/telegram/dialogs', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const client = await getTelegramClient(email);
    if (!client) {
      return res.status(400).json({ error: 'Telegram not connected' });
    }

    const dialogsResult = await client.getDialogs({ limit: 50 });
    
    const dialogs = dialogsResult.map(dialog => {
      let type = 'user';
      if (dialog.isGroup) type = 'group';
      if (dialog.isChannel) type = 'channel';

      return {
        id: dialog.id?.toString() || '',
        name: dialog.title || dialog.name || 'Unknown',
        type,
        unreadCount: dialog.unreadCount || 0,
        lastMessage: dialog.message?.message || '',
        lastMessageDate: dialog.message?.date 
          ? new Date(dialog.message.date * 1000).toISOString() 
          : '',
        lastMessageSender: dialog.message?.fromId?.toString() || '',
      };
    });

    await client.disconnect();
    res.json({ dialogs });
  } catch (error) {
    console.error('Telegram dialogs error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch dialogs' });
  }
});

// POST /api/telegram/messages — Fetch messages from a specific chat
app.post('/api/telegram/messages', async (req, res) => {
  try {
    const { email, chatId, period } = req.body;
    if (!email || !chatId) return res.status(400).json({ error: 'Email and chatId are required' });

    const client = await getTelegramClient(email);
    if (!client) {
      return res.status(400).json({ error: 'Telegram not connected' });
    }

    const { startDate, endDate } = getDateRange(period || 'today');

    const messages = await client.getMessages(chatId, {
      limit: 200,
      offsetDate: Math.floor(endDate.getTime() / 1000),
    });

    const filteredMessages = messages
      .filter(msg => {
        if (!msg.date) return false;
        const msgDate = new Date(msg.date * 1000);
        return msgDate >= startDate && msgDate <= endDate;
      })
      .map(msg => {
        let senderName = 'Unknown';
        let senderUsername = '';
        
        if (msg.sender) {
          senderName = msg.sender.firstName 
            ? `${msg.sender.firstName} ${msg.sender.lastName || ''}`.trim()
            : msg.sender.title || 'Unknown';
          senderUsername = msg.sender.username || '';
        }

        return {
          id: msg.id,
          text: msg.message || '',
          sender: senderName,
          senderUsername,
          date: new Date(msg.date * 1000).toISOString(),
        };
      })
      .filter(msg => msg.text); // Only include text messages

    await client.disconnect();
    res.json({ messages: filteredMessages });
  } catch (error) {
    console.error('Telegram messages error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch messages' });
  }
});

// POST /api/telegram/messages/all — Fetch messages from ALL chats for a time period
app.post('/api/telegram/messages/all', async (req, res) => {
  try {
    const { email, period } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const client = await getTelegramClient(email);
    if (!client) {
      return res.status(400).json({ error: 'Telegram not connected' });
    }

    const { startDate, endDate } = getDateRange(period || 'today');
    const dialogsResult = await client.getDialogs({ limit: 30 });

    const allMessages = [];
    let chatCount = 0;

    for (const dialog of dialogsResult) {
      try {
        const chatName = dialog.title || dialog.name || 'Unknown Chat';
        const chatId = dialog.id?.toString() || '';
        
        const messages = await client.getMessages(dialog.inputEntity, {
          limit: 100,
          offsetDate: Math.floor(endDate.getTime() / 1000),
        });

        const filteredMessages = messages
          .filter(msg => {
            if (!msg.date || !msg.message) return false;
            const msgDate = new Date(msg.date * 1000);
            return msgDate >= startDate && msgDate <= endDate;
          })
          .map(msg => {
            let senderName = 'Unknown';
            let senderUsername = '';
            
            if (msg.sender) {
              senderName = msg.sender.firstName 
                ? `${msg.sender.firstName} ${msg.sender.lastName || ''}`.trim()
                : msg.sender.title || 'Unknown';
              senderUsername = msg.sender.username || '';
            }

            return {
              id: msg.id,
              text: msg.message,
              sender: senderName,
              senderUsername: senderUsername || senderName,
              date: new Date(msg.date * 1000).toISOString(),
              chatName,
              chatId,
            };
          });

        if (filteredMessages.length > 0) {
          chatCount++;
          allMessages.push(...filteredMessages);
        }
      } catch (chatError) {
        // Skip chats that fail (e.g., channels where we can't read)
        console.log(`Skipped chat: ${dialog.title || 'unknown'} — ${chatError.message}`);
      }
    }

    await client.disconnect();
    
    // Sort by date descending
    allMessages.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ 
      messages: allMessages, 
      chatCount,
      totalMessages: allMessages.length,
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  } catch (error) {
    console.error('Telegram all messages error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch messages' });
  }
});

// =============================================
// GEMINI AI SUMMARIZATION
// =============================================

app.post('/api/summarize', async (req, res) => {
  try {
    const { email, period } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Step 1: Fetch messages from Telegram
    const client = await getTelegramClient(email);
    if (!client) {
      return res.status(400).json({ error: 'Telegram not connected' });
    }

    const { startDate, endDate } = getDateRange(period || 'today');
    const dialogsResult = await client.getDialogs({ limit: 25 });

    const allMessages = [];
    let chatCount = 0;

    for (const dialog of dialogsResult) {
      try {
        const chatName = dialog.title || dialog.name || 'Unknown Chat';
        
        const messages = await client.getMessages(dialog.inputEntity, {
          limit: 80,
          offsetDate: Math.floor(endDate.getTime() / 1000),
        });

        const filteredMessages = messages
          .filter(msg => {
            if (!msg.date || !msg.message) return false;
            const msgDate = new Date(msg.date * 1000);
            return msgDate >= startDate && msgDate <= endDate;
          })
          .map(msg => {
            let senderName = 'Unknown';
            let senderUsername = '';
            
            if (msg.sender) {
              senderName = msg.sender.firstName 
                ? `${msg.sender.firstName} ${msg.sender.lastName || ''}`.trim()
                : msg.sender.title || 'Unknown';
              senderUsername = msg.sender.username || senderName;
            }

            return {
              text: msg.message,
              sender: senderName,
              senderUsername,
              date: new Date(msg.date * 1000).toISOString(),
              chatName,
            };
          });

        if (filteredMessages.length > 0) {
          chatCount++;
          allMessages.push(...filteredMessages);
        }
      } catch (chatError) {
        console.log(`Skipped chat: ${dialog.title || 'unknown'}`);
      }
    }

    await client.disconnect();

    if (allMessages.length === 0) {
      return res.json({ 
        summary: {
          period,
          periodLabel: period === 'today' ? 'Today' : period === 'yesterday' ? 'Yesterday' : 'Past Week',
          overview: 'No messages found for this time period.',
          importantMessages: [],
          dueDates: [],
          actionItems: [],
          messageCount: 0,
          chatCount: 0
        }
      });
    }

    // Step 2: Format messages for Gemini
    const chatGroups = {};
    allMessages.forEach(msg => {
      if (!chatGroups[msg.chatName]) chatGroups[msg.chatName] = [];
      chatGroups[msg.chatName].push(msg);
    });

    let formattedText = `TELEGRAM MESSAGES — Period: ${period === 'today' ? 'Today' : period === 'yesterday' ? 'Yesterday' : 'Past 7 Days'}\n`;
    formattedText += `Total: ${allMessages.length} messages from ${chatCount} chats\n\n`;

    for (const [chatName, messages] of Object.entries(chatGroups)) {
      formattedText += `=== Chat: ${chatName} ===\n`;
      messages.forEach(msg => {
        const time = new Date(msg.date).toLocaleTimeString();
        formattedText += `[${time}] @${msg.senderUsername}: ${msg.text}\n`;
      });
      formattedText += `\n`;
    }

    // Step 3: Call Gemini API
    const geminiPrompt = `You are an AI assistant for the CRUX app that summarizes Telegram messages. Analyze the following messages and provide a structured summary.

IMPORTANT: Respond ONLY with a valid JSON object, no markdown, no code fences, no extra text. The JSON must have this exact structure:
{
  "overview": "A comprehensive paragraph summarizing what happened across all conversations",
  "importantMessages": [
    {"username": "@username", "message": "The important message content"}
  ],
  "dueDates": [
    {"task": "Task description", "dueDate": "The deadline date", "mentionedBy": "@username"}
  ],
  "actionItems": [
    {"item": "What needs to be done", "assignedTo": "@username or 'unassigned'"}
  ]
}

Rules:
- In the overview, mention all chats and summarize key discussions
- For importantMessages, pick the most critical or notable messages (max 8). Include decisions, announcements, important info
- For dueDates, detect ANY mention of deadlines, due dates, submission dates, "by Friday", "before Monday", "tomorrow", etc. If no due dates found, return empty array
- For actionItems, detect tasks, to-dos, work assignments, requests. If none found, return empty array
- Always include the sender's @username
- Be concise but thorough

Messages to analyze:
${formattedText}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: geminiPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
          }
        }),
      }
    );

    const geminiData = await geminiResponse.json();
    
    let summaryData;
    try {
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('Gemini raw response:', rawText.substring(0, 500));
      // Strip markdown code fences if present
      const cleanedText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      summaryData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError.message);
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Try to extract JSON from the response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          summaryData = JSON.parse(jsonMatch[0]);
        } catch (e) {
          summaryData = {
            overview: rawText || 'Summary generated but could not be structured.',
            importantMessages: [],
            dueDates: [],
            actionItems: []
          };
        }
      } else {
        summaryData = {
          overview: rawText || 'Summary generated but could not be structured.',
          importantMessages: [],
          dueDates: [],
          actionItems: []
        };
      }
    }

    res.json({
      summary: {
        period,
        periodLabel: period === 'today' ? 'Today' : period === 'yesterday' ? 'Yesterday' : 'Past Week',
        overview: summaryData.overview || 'No overview generated.',
        importantMessages: summaryData.importantMessages || [],
        dueDates: summaryData.dueDates || [],
        actionItems: summaryData.actionItems || [],
        messageCount: allMessages.length,
        chatCount
      }
    });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate summary' });
  }
});

// POST /api/summarize/chat — Summarize a SINGLE chat
app.post('/api/summarize/chat', async (req, res) => {
  try {
    const { email, chatId, chatName, period } = req.body;
    if (!email || !chatId) return res.status(400).json({ error: 'Email and chatId are required' });

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return res.status(500).json({ error: 'Gemini API key not configured' });

    const client = await getTelegramClient(email);
    if (!client) return res.status(400).json({ error: 'Telegram not connected' });

    const { startDate, endDate } = getDateRange(period || 'today');

    let entity;
    try {
      entity = await client.getEntity(chatId);
    } catch (e) {
      // Try as integer
      try {
        entity = await client.getEntity(parseInt(chatId));
      } catch (e2) {
        await client.disconnect();
        return res.status(400).json({ error: 'Could not find this chat' });
      }
    }

    const messages = await client.getMessages(entity, {
      limit: 200,
      offsetDate: Math.floor(endDate.getTime() / 1000),
    });

    const filteredMessages = messages
      .filter(msg => {
        if (!msg.date || !msg.message) return false;
        const msgDate = new Date(msg.date * 1000);
        return msgDate >= startDate && msgDate <= endDate;
      })
      .map(msg => {
        let senderName = 'Unknown';
        let senderUsername = '';
        if (msg.sender) {
          senderName = msg.sender.firstName
            ? `${msg.sender.firstName} ${msg.sender.lastName || ''}`.trim()
            : msg.sender.title || 'Unknown';
          senderUsername = msg.sender.username || senderName;
        }
        return {
          text: msg.message,
          sender: senderName,
          senderUsername,
          date: new Date(msg.date * 1000).toISOString(),
        };
      });

    await client.disconnect();

    if (filteredMessages.length === 0) {
      return res.json({
        summary: {
          period,
          periodLabel: period === 'today' ? 'Today' : period === 'yesterday' ? 'Yesterday' : 'Past Week',
          chatName: chatName || 'Chat',
          overview: 'No messages found for this time period in this chat.',
          importantMessages: [],
          dueDates: [],
          actionItems: [],
          messageCount: 0,
          chatCount: 1
        }
      });
    }

    let formattedText = `TELEGRAM CHAT: ${chatName || 'Chat'}\n`;
    formattedText += `Period: ${period === 'today' ? 'Today' : period === 'yesterday' ? 'Yesterday' : 'Past 7 Days'}\n`;
    formattedText += `Total: ${filteredMessages.length} messages\n\n`;
    filteredMessages.forEach(msg => {
      const time = new Date(msg.date).toLocaleTimeString();
      formattedText += `[${time}] @${msg.senderUsername}: ${msg.text}\n`;
    });

    const geminiPrompt = `You are an AI assistant for the CRUX app that summarizes Telegram messages. Analyze the following messages from a single chat and provide a structured summary.

IMPORTANT: Respond ONLY with a valid JSON object. The JSON must have this exact structure:
{
  "overview": "A comprehensive paragraph summarizing what happened in this conversation",
  "importantMessages": [
    {"username": "@username", "message": "The important message content"}
  ],
  "dueDates": [
    {"task": "Task description", "dueDate": "The deadline date", "mentionedBy": "@username"}
  ],
  "actionItems": [
    {"item": "What needs to be done", "assignedTo": "@username or 'unassigned'"}
  ]
}

Rules:
- Summarize what was discussed in this chat
- For importantMessages, pick the most critical messages (max 6)
- For dueDates, detect deadlines, due dates, "by Friday", "before Monday", etc. Empty array if none
- For actionItems, detect tasks, to-dos, requests. Empty array if none
- Always include the sender's @username

Messages to analyze:
${formattedText}`;

    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: geminiPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
          }
        }),
      }
    );

    const geminiData = await geminiResponse.json();
    let summaryData;
    try {
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanedText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      summaryData = JSON.parse(cleanedText);
    } catch (e) {
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      summaryData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        overview: rawText || 'Could not structure summary.',
        importantMessages: [], dueDates: [], actionItems: []
      };
    }

    res.json({
      summary: {
        period,
        periodLabel: period === 'today' ? 'Today' : period === 'yesterday' ? 'Yesterday' : 'Past Week',
        chatName: chatName || 'Chat',
        overview: summaryData.overview || '',
        importantMessages: summaryData.importantMessages || [],
        dueDates: summaryData.dueDates || [],
        actionItems: summaryData.actionItems || [],
        messageCount: filteredMessages.length,
        chatCount: 1
      }
    });
  } catch (error) {
    console.error('Chat summarization error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate summary' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
