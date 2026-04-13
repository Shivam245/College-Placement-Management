import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const db = new Database('campusdrive.db');
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_change_me';

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT,
    displayName TEXT,
    photoURL TEXT,
    profile TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    companyId TEXT,
    companyName TEXT,
    title TEXT,
    description TEXT,
    minCGPA REAL,
    eligibleBranches TEXT,
    deadline TEXT,
    status TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    jobId TEXT,
    jobTitle TEXT,
    companyName TEXT,
    studentId TEXT,
    studentName TEXT,
    studentEmail TEXT,
    studentCGPA REAL,
    resumeUrl TEXT,
    status TEXT,
    appliedAt TEXT
  );
`);

// Migration: Add deadline column to jobs if it doesn't exist
try {
  db.prepare("ALTER TABLE jobs ADD COLUMN deadline TEXT").run();
} catch (e) {
  // Column already exists or other error
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // --- Auth Routes ---
  app.post('/api/upload/resume', authenticate, upload.single('resume'), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const resumeUrl = `/uploads/${req.file.filename}`;
    res.json({ resumeUrl });
  });
  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, role, displayName, profile } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const uid = Math.random().toString(36).substring(2, 15);
      const createdAt = new Date().toISOString();
      
      const stmt = db.prepare('INSERT INTO users (uid, email, password, role, displayName, profile, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
      stmt.run(uid, email, hashedPassword, role, displayName, JSON.stringify(profile || {}), createdAt);
      
      const token = jwt.sign({ uid, email, role }, JWT_SECRET, { expiresIn: '24h' });
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      res.json({ uid, email, role, displayName, profile, createdAt });
    } catch (err: any) {
      if (err.message.includes('UNIQUE constraint failed: users.email')) {
        res.status(400).json({ error: 'An account with this email already exists. Please Sign In instead.' });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    try {
      const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) {
        console.log(`Login failed: User ${email} not found in database.`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log(`Login failed: Incorrect password for ${email}.`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      console.log(`Login successful for: ${email}`);
      const token = jwt.sign({ uid: user.uid, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      res.json({ 
        uid: user.uid, 
        email: user.email, 
        role: user.role, 
        displayName: user.displayName, 
        profile: JSON.parse(user.profile), 
        createdAt: user.createdAt 
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not logged in' });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user: any = db.prepare('SELECT * FROM users WHERE uid = ?').get(decoded.uid);
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      res.json({ 
        uid: user.uid, 
        email: user.email, 
        role: user.role, 
        displayName: user.displayName, 
        profile: JSON.parse(user.profile), 
        createdAt: user.createdAt 
      });
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  // --- Data Routes ---
  app.get('/api/jobs', authenticate, (req, res) => {
    const jobs = db.prepare('SELECT * FROM jobs').all();
    res.json(jobs.map((j: any) => ({ ...j, eligibleBranches: JSON.parse(j.eligibleBranches) })));
  });

  app.post('/api/jobs', authenticate, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'recruiter') return res.status(403).json({ error: 'Forbidden' });
    const { title, description, minCGPA, eligibleBranches, companyName, deadline } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    const createdAt = new Date().toISOString();
    
    const stmt = db.prepare('INSERT INTO jobs (id, companyId, companyName, title, description, minCGPA, eligibleBranches, deadline, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, req.user.uid, companyName, title, description, minCGPA, JSON.stringify(eligibleBranches), deadline || null, 'active', createdAt);
    res.json({ id, title, createdAt, deadline });
  });

  app.patch('/api/jobs/:id', authenticate, (req: any, res) => {
    const { status } = req.body;
    const stmt = db.prepare('UPDATE jobs SET status = ? WHERE id = ?');
    stmt.run(status, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/jobs/:id', authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/applications', authenticate, (req: any, res) => {
    let apps;
    if (req.user.role === 'student') {
      apps = db.prepare('SELECT * FROM applications WHERE studentId = ?').all(req.user.uid);
    } else {
      apps = db.prepare('SELECT * FROM applications').all();
    }
    res.json(apps);
  });

  app.post('/api/applications', authenticate, (req: any, res) => {
    const { jobId, jobTitle, companyName, studentName, studentEmail, studentCGPA, resumeUrl } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    const appliedAt = new Date().toISOString();
    
    const stmt = db.prepare('INSERT INTO applications (id, jobId, jobTitle, companyName, studentId, studentName, studentEmail, studentCGPA, resumeUrl, status, appliedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, jobId, jobTitle, companyName, req.user.uid, studentName, studentEmail, studentCGPA, resumeUrl, 'applied', appliedAt);
    res.json({ id, appliedAt });
  });

  app.patch('/api/applications/:id', authenticate, (req, res) => {
    const { status } = req.body;
    const stmt = db.prepare('UPDATE applications SET status = ? WHERE id = ?');
    stmt.run(status, req.params.id);
    res.json({ success: true });
  });

  app.get('/api/users', authenticate, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const users = db.prepare('SELECT uid, email, role, displayName, profile, createdAt FROM users').all();
    res.json(users.map((u: any) => ({ ...u, profile: JSON.parse(u.profile) })));
  });

  app.patch('/api/users/me', authenticate, (req: any, res) => {
    const { profile } = req.body;
    console.log(`Updating profile for user ${req.user.uid}:`, profile);
    try {
      const stmt = db.prepare('UPDATE users SET profile = ? WHERE uid = ?');
      const result = stmt.run(JSON.stringify(profile), req.user.uid);
      if (result.changes === 0) {
        console.log(`Profile update failed: User ${req.user.uid} not found.`);
        return res.status(404).json({ error: 'User not found' });
      }
      console.log(`Profile updated successfully for user ${req.user.uid}`);
      res.json({ success: true });
    } catch (err: any) {
      console.error(`Error updating profile for user ${req.user.uid}:`, err);
      res.status(400).json({ error: err.message });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
