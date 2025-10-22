const Database = require("better-sqlite3");
const path = require("path");

// Create or open database file
const dbpath = path.join(__dirname, "..", "data", "work.db");
const db = new Database(dbpath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

function initializedb() {
  
  // Create people table
  db.exec( `
    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      notes TEXT DEFAULT ''
    )
  ` )

  // Create landlords table
  db.exec( `
    CREATE TABLE IF NOT EXISTS landlords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_email TEXT,
      contact_phone TEXT,
      notes TEXT DEFAULT ''
    )
  ` )

  // Create buildings table
  db.exec( `
    CREATE TABLE IF NOT EXISTS buildings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      landlord_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      notes TEXT DEFAULT '',
      FOREIGN KEY (landlord_id) REFERENCES landlords(id) ON DELETE CASCADE
    )
  ` )

  // Create rooms table
  db.exec( `
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_id INTEGER NOT NULL,
      room_number TEXT NOT NULL,
      capacity INTEGER DEFAULT 1,
      notes TEXT DEFAULT '',
      FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
    )
  ` )

  // Create schedule table for assignments
  db.exec( `
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_id INTEGER NOT NULL,
      room_id INTEGER,
      schedule_date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      notes TEXT DEFAULT '',
      FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
    )
  ` )

  // Insert sample data if tables are empty
  const peoplecount = db.prepare( "SELECT COUNT(*) as count FROM people" ).get()
  
  if( peoplecount['count'] === 0) {
    const insertpeople = db.prepare( `
      INSERT INTO people (name, email, notes) 
      VALUES (?, ?, ?)
    ` )

    insertpeople.run( "Kermit Frog", "kermit@muppets.com", "Lead performer" )
    insertpeople.run( "Miss Piggy", "piggy@muppets.com", "Star of the show" )
    insertpeople.run( "Fozzie Bear", "fozzie@muppets.com", "Comedian" )
    
    console.log( "Sample people data inserted" )
  }

  console.log( "Database initialized successfully" )
}


function getdb() {
  return db;
}

function closedb() {
  db.close();
}

module.exports = { initializedb, getdb, closedb };
