const express = require('express');
const serverless = require('serverless-http');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const bcrypt = require('bcryptjs');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'decorator-secret-key-2026';
const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'ramadan.nady1985@gmail.com').toLowerCase();
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || '01099797984';

// In-memory storage for serverless (you should use a database in production)
let projectsCache = [];
let usersCache = [];
let contentCache = { siteTitle: 'Decorator', intro: 'الترحيب' };

app.use(express.json());

// Helper functions
function verifyOwner(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload && payload.email === OWNER_EMAIL && payload.role === 'owner') {
      req.user = payload;
      return next();
    }
    res.status(403).json({ error: 'Forbidden' });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Login as owner
app.post('/.netlify/functions/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (email && password && email.toLowerCase() === OWNER_EMAIL && password === OWNER_PASSWORD) {
    const token = jwt.sign({ email: OWNER_EMAIL, role: 'owner' }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token, owner: true });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// Auth check
app.get('/.netlify/functions/api/auth', (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return res.json({ owner: false });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload && payload.email === OWNER_EMAIL && payload.role === 'owner') {
      return res.json({ owner: true, email: payload.email });
    }
    res.json({ owner: false });
  } catch {
    res.json({ owner: false });
  }
});

// Projects API
app.get('/.netlify/functions/api/projects', async (req, res) => {
  res.json(projectsCache.slice().reverse());
});

app.post('/.netlify/functions/api/projects', verifyOwner, async (req, res) => {
  const { name, clientName, clientPhone, type, status, location, notes } = req.body || {};
  if (!name || !clientName) return res.status(400).json({ error: 'Missing required fields' });
  const proj = {
    id: Date.now(),
    name, clientName, clientPhone, type,
    status: status || 'جديد',
    location, notes,
    createdAt: new Date().toISOString()
  };
  projectsCache.push(proj);
  res.json({ ok: true, project: proj });
});

app.delete('/.netlify/functions/api/projects/:id', verifyOwner, async (req, res) => {
  const { id } = req.params;
  projectsCache = projectsCache.filter(p => p.id !== parseInt(id));
  res.json({ ok: true });
});

// Content API
app.get('/.netlify/functions/api/content', async (req, res) => {
  res.json(contentCache);
});

app.put('/.netlify/functions/api/content', verifyOwner, async (req, res) => {
  contentCache = { ...contentCache, ...req.body };
  res.json({ ok: true });
});

// User Registration
app.post('/.netlify/functions/api/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' });
    }
    
    if (usersCache.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'البريد الإلكتروني مسجل من قبل' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: Date.now(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || null,
      createdAt: new Date().toISOString()
    };
    
    usersCache.push(newUser);
    
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      ok: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'خطأ في التسجيل' });
  }
});

// User Login
app.post('/.netlify/functions/api/user-login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبة' });
    }
    
    const user = usersCache.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'خطأ في تسجيل الدخول' });
  }
});

// Verify User Token
app.get('/.netlify/functions/api/me', async (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role === 'owner') {
      return res.json({ ok: true, user: { email: payload.email, role: 'owner' } });
    }
    
    const user = usersCache.find(u => u.id === payload.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        role: 'user'
      }
    });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

exports.handler = serverless(app);
