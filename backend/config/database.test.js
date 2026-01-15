const sqlite3 = require('sqlite3').verbose();

let db = null;

function getTestDatabase() {
  if (db) {
    return db;
  }

  db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
      console.error('Error opening test database:', err);
    }
  });

  initializeTables();
  return db;
}

function initializeTables() {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Rooms table
  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      description TEXT,
      amenities TEXT,
      available BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating rooms table:', err);
      return;
    }

    // Insert sample rooms
    const sampleRooms = [
      { name: 'Salle Conférence A', capacity: 50, description: 'Grande salle avec projecteur et système audio', amenities: 'Projecteur,Audio,WiFi,Climatisation' },
      { name: 'Salle Réunion B', capacity: 10, description: 'Salle de réunion intime', amenities: 'Tableau blanc,WiFi,Écran TV' },
      { name: 'Salle Formation C', capacity: 30, description: 'Salle de formation avec tables modulables', amenities: 'Projecteur,WiFi,Tables modulables' },
      { name: 'Salle Executive D', capacity: 8, description: 'Salle de direction premium', amenities: 'Visioconférence,WiFi,Climatisation,Café' },
      { name: 'Espace Coworking E', capacity: 20, description: 'Espace de travail partagé', amenities: 'WiFi,Prises électriques,Café' }
    ];

    const stmt = db.prepare('INSERT INTO rooms (name, capacity, description, amenities) VALUES (?, ?, ?, ?)');
    sampleRooms.forEach(room => {
      stmt.run(room.name, room.capacity, room.description, room.amenities);
    });
    stmt.finalize();
  });

  // Bookings table
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      booking_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    )
  `);
}

function closeDatabase() {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        }
        db = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = { getTestDatabase, closeDatabase };