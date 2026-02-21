'use strict';
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const OWNER_EMAIL = 'ramadan.nady1985@gmail.com';
const OWNER_PASSWORD = '01099797984';
const DB_PATH = path.resolve(__dirname, 'cms.db');
let db;

function getDB() {
  if (db) return db;
  db = new sqlite3.Database(DB_PATH);
  return db;
}

function initTables() {
  const d = getDB();
  d.serialize(() => {
    d.run('CREATE TABLE IF NOT EXISTS owners (email TEXT PRIMARY KEY, password_hash TEXT)');
    d.run('CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, status TEXT)');
    d.run('CREATE TABLE IF NOT EXISTS content (key TEXT PRIMARY KEY, value TEXT)');
  });
}

function initDB(cb) {
  initTables();
  const d = getDB();
  d.get('SELECT 1 FROM owners WHERE email = ?', [OWNER_EMAIL], (err, row) => {
    if (err) return cb(err);
    if (row) return cb(null);
    const hash = bcrypt.hashSync(OWNER_PASSWORD, 10);
    d.run('INSERT INTO owners(email, password_hash) VALUES(?, ?)', [OWNER_EMAIL, hash], cb);
  });
}

function getOwner(email, cb) {
  const p = new Promise((resolve, reject) => {
    getDB().get('SELECT * FROM owners WHERE email = ?', [email], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
  if (typeof cb === 'function') {
    p.then((row) => cb(null, row)).catch((err) => cb(err));
  }
  return p;
}

function getContent(key, cb) {
  const p = new Promise((resolve, reject) => {
    getDB().get('SELECT value FROM content WHERE key = ?', [key], (err, row) => {
      if (err) return reject(err);
      resolve(row ? row.value : null);
    });
  });
  if (typeof cb === 'function') {
    p.then((v) => cb(null, v)).catch((err) => cb(err));
  }
  return p;
}

function setContent(key, value, cb) {
  const p = new Promise((resolve, reject) => {
    getDB().run('INSERT OR REPLACE INTO content(key, value) VALUES(?, ?)', [key, value], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
  if (typeof cb === 'function') {
    p.then(() => cb(null)).catch((err) => cb(err));
  }
  return p;
}

function getProjects(cb) {
  const p = new Promise((resolve, reject) => {
    getDB().all('SELECT id, title, description, status FROM projects', [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
  if (typeof cb === 'function') {
    p.then((rows) => cb(null, rows)).catch((err) => cb(err));
  }
  return p;
}

function addProject(input, cb) {
  // Support both old (title, description, status, cb) and new ({...}, cb) call styles
  let title, description, status;
  if (input && typeof input === 'object' && input.hasOwnProperty('name')) {
    title = input.name;
    description = input && input.notes ? JSON.stringify(input) : '';
    status = input.status || 'new';
  } else {
    title = input;
    description = '';
    status = 'new';
  }
  const p = new Promise((resolve, reject) => {
    getDB().run('INSERT INTO projects(title, description, status) VALUES(?,?,?)', [title, description, status], function(err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
  if (typeof cb === 'function') {
    p.then((id) => cb(null, id)).catch((err) => cb(err));
  }
  return p;
}

module.exports = {
  initDB,
  getOwner,
  getContent,
  setContent,
  getProjects,
  addProject,
  OWNER_EMAIL
};
