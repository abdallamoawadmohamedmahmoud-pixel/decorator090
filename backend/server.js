const express = require('express')
const fs = require('fs').promises
const path = require('path')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const bcrypt = require('bcryptjs')
// const CMSDB = require('./db') // Temporarily disabled

const app = express()
const UPLOADS_DIR = path.join(__dirname, '../uploads')
const PROJECTS_UPLOADS = path.join(UPLOADS_DIR, 'projects')
const PROFILES_UPLOADS = path.join(UPLOADS_DIR, 'profiles')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PROJECTS_UPLOADS)
  },
  filename: (req, file, cb) => {
    const ext = (file.originalname && path.extname(file.originalname)) || '.bin'
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext)
  }
})

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PROFILES_UPLOADS)
  },
  filename: (req, file, cb) => {
    const ext = (file.originalname && path.extname(file.originalname)) || '.bin'
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\//.test(file.mimetype) || /^video\//.test(file.mimetype)
    cb(null, !!ok)
  }
})

const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\//.test(file.mimetype)
    cb(null, !!ok)
  }
})

const port = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'change-me'

// Owner credentials (can be overridden by environment variables for production)
const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'ramadan.nady1985@gmail.com').toLowerCase()
const OWNER_PASSWORD = (process.env.OWNER_PASSWORD || '01099797984')

const DATA_DIR = path.join(__dirname, '../data')
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json')
const CONTENT_FILE = path.join(DATA_DIR, 'content.json')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

app.use(express.json())
// مجلد الرفع (صور وفيديو المشاريع)
app.use('/uploads', express.static(UPLOADS_DIR))
// مجلد public أولاً (لوحة المالك و admin) ثم جذر المشروع (الصفحة الرئيسية وكل الصفحات)
app.use('/', express.static(path.join(__dirname, '../public')))
app.use('/', express.static(path.join(__dirname, '..')))

async function ensureData() {
  try { await fs.mkdir(DATA_DIR) } catch (e) {}
  try { await fs.mkdir(UPLOADS_DIR) } catch (e) {}
  try { await fs.mkdir(PROJECTS_UPLOADS) } catch (e) {}
  try { await fs.mkdir(PROFILES_UPLOADS) } catch (e) {}
  try { await fs.access(PROJECTS_FILE) } catch { await fs.writeFile(PROJECTS_FILE, '[]') }
  try { await fs.access(CONTENT_FILE) } catch { await fs.writeFile(CONTENT_FILE, '{}') }
  try { await fs.access(USERS_FILE) } catch { await fs.writeFile(USERS_FILE, '[]') }
}
ensureData()
// CMSDB.openDB().then(() => console.log('CMS DB ready')).catch(() => console.log('CMS DB init issue'))

function verifyOwner(req, res, next) {
  const auth = req.headers['authorization']
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const token = auth.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload && payload.email === OWNER_EMAIL && payload.role === 'owner') {
      req.user = payload
      return next()
    }
    res.status(403).json({ error: 'Forbidden' })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Login as owner
app.post('/cms/login', (req, res) => {
  const { email, password } = req.body || {}
  if (email && password && email.toLowerCase() === OWNER_EMAIL.toLowerCase() && password === OWNER_PASSWORD) {
    const token = jwt.sign({ email: OWNER_EMAIL, role: 'owner' }, JWT_SECRET, { expiresIn: '2h' })
    return res.json({ token, owner: true })
  }
  res.status(401).json({ error: 'Invalid credentials' })
})

// User Registration
app.post('/api/register', profileUpload.single('avatar'), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body || {}
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' })
    }
    
    const data = await fs.readFile(USERS_FILE, 'utf8')
    const users = JSON.parse(data)
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'البريد الإلكتروني مسجل من قبل' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    const avatarUrl = req.file ? '/uploads/profiles/' + req.file.filename : null
    
    const newUser = {
      id: Date.now(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || null,
      avatar: avatarUrl,
      createdAt: new Date().toISOString()
    }
    
    users.push(newUser)
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
    
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' })
    
    res.json({ 
      ok: true, 
      token, 
      user: { 
        id: newUser.id, 
        name: newUser.name, 
        email: newUser.email, 
        phone: newUser.phone, 
        avatar: newUser.avatar 
      } 
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'خطأ في التسجيل' })
  }
})

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبة' })
    }
    
    const data = await fs.readFile(USERS_FILE, 'utf8')
    const users = JSON.parse(data)
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
    }
    
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' })
    
    res.json({ 
      ok: true, 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        avatar: user.avatar 
      } 
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'خطأ في تسجيل الدخول' })
  }
})

// Verify User Token
app.get('/api/me', async (req, res) => {
  const auth = req.headers['authorization']
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const token = auth.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.role === 'owner') {
      return res.json({ ok: true, user: { email: payload.email, role: 'owner' } })
    }
    
    const data = await fs.readFile(USERS_FILE, 'utf8')
    const users = JSON.parse(data)
    const user = users.find(u => u.id === payload.id)
    
    if (!user) return res.status(404).json({ error: 'User not found' })
    
    res.json({ 
      ok: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        avatar: user.avatar,
        createdAt: user.createdAt,
        role: 'user'
      } 
    })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

// Auth check
app.get('/cms/auth', (req, res) => {
  const auth = req.headers['authorization']
  if (!auth || !auth.startsWith('Bearer ')) return res.json({ owner: false })
  const token = auth.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload && payload.email === OWNER_EMAIL && payload.role === 'owner') {
      return res.json({ owner: true, email: payload.email })
    }
    res.json({ owner: false })
  } catch {
    res.json({ owner: false })
  }
})

// رفع صور وفيديو للمشاريع (للمالك فقط)
app.post('/cms/upload', verifyOwner, (req, res, next) => {
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }])(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'خطأ في رفع الملف', detail: err.message })
    const files = req.files || {}
    const imageUrl = files.image && files.image[0] ? '/uploads/projects/' + files.image[0].filename : null
    const videoUrl = files.video && files.video[0] ? '/uploads/projects/' + files.video[0].filename : null
    res.json({ ok: true, imageUrl, videoUrl })
  })
})

// Projects
app.get('/cms/projects', verifyOwner, async (req, res) => {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf8')
    const rows = JSON.parse(data)
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: 'DB error' })
  }
})

app.post('/cms/projects', verifyOwner, async (req, res) => {
  const { name, clientName, clientPhone, type, status, location, notes, imageUrl, videoUrl } = req.body || {}
  if (!name || !clientName) return res.status(400).json({ error: 'Missing required fields' })
  const proj = { name, clientName, clientPhone, type, status: status || 'جديد', location, notes, imageUrl: imageUrl || null, videoUrl: videoUrl || null, createdAt: new Date().toISOString() }
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf8')
    const projects = JSON.parse(data)
    const id = Date.now()
    proj.id = id
    projects.push(proj)
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2))
    res.json({ ok: true, project: proj })
  } catch (e) {
    res.status(500).json({ error: 'DB error' })
  }
})

// حذف مشروع
app.delete('/cms/projects/:id', verifyOwner, async (req, res) => {
  const { id } = req.params
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf8')
    let projects = JSON.parse(data)
    const projectId = parseInt(id)
    projects = projects.filter(p => p.id !== projectId)
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2))
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'DB error' })
  }
})

// Content CMS (optional simple)
app.get('/cms/content', verifyOwner, async (req, res) => {
  const data = await fs.readFile(CONTENT_FILE, 'utf8')
  res.json(JSON.parse(data))
})

// —— API عامة للموقع (بدون تسجيل دخول) لربط الموقع بالـ CMS ——
app.get('/api/content', async (req, res) => {
  try {
    const data = await fs.readFile(CONTENT_FILE, 'utf8')
    res.json(JSON.parse(data))
  } catch (e) {
    res.json({ siteTitle: '', intro: '' })
  }
})

app.get('/api/projects', async (req, res) => {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf8')
    const list = JSON.parse(data)
    // أحدث المشاريع أولاً (للعرض في الموقع)
    const sorted = (Array.isArray(list) ? list : []).slice().reverse()
    res.json(sorted)
  } catch (e) {
    res.json([])
  }
})
app.put('/cms/content', verifyOwner, async (req, res) => {
  await fs.writeFile(CONTENT_FILE, JSON.stringify(req.body, null, 2))
  res.json({ ok: true })
})

// Start
const run = async () => {
  const port = process.env.PORT || 3000
  app.listen(port, () => console.log('CMS server running on', port))
}
run()
