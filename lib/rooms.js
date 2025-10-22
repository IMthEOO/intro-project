const { getdb } = require( "./db" )

/**
 * @typedef { Object } room
 * @property { number } id
 * @property { number } building_id
 * @property { string } room_number
 * @property { number } [ capacity ]
 * @property { string } [ notes ]
 * @property { string } [ building_name ]
 * @property { string } [ landlord_name ]
 */

/**
 * Get all rooms from database with building and landlord info
 * @param { URL } parsedurl 
 * @returns { Promise< Array< room > > }
 */
async function get( parsedurl ) {
  const db = getdb()
  const stmt = db.prepare( `
    SELECT 
      r.*,
      b.name as building_name,
      l.name as landlord_name
    FROM rooms r
    LEFT JOIN buildings b ON r.building_id = b.id
    LEFT JOIN landlords l ON b.landlord_id = l.id
    ORDER BY b.name, r.room_number
  ` )
  const rooms = stmt.all()
  return /** @type { Array< room > } */ ( rooms )
}

/**
 * Add or update a room in database
 * @param { string } parsedurl
 * @param { string } method
 * @param { room } room
 * @return { Promise< object > }
 */
async function add( parsedurl, method, room ) {
  const db = getdb()

  // Validate building exists
  const buildingstmt = db.prepare( "SELECT id FROM buildings WHERE id = ?" )
  const building = buildingstmt.get( room.building_id )
  
  if( !building ) {
    return { error: "Building not found", building_id: room.building_id }
  }

  if( undefined !== room.id ) {
    // Update existing room
    const stmt = db.prepare( `
      UPDATE rooms 
      SET building_id = ?, room_number = ?, capacity = ?, notes = ?
      WHERE id = ?
    ` )
    
    const info = stmt.run( 
      room.building_id,
      room.room_number, 
      room.capacity || 1, 
      room.notes || "", 
      room.id 
    )
    
    if( 0 === info.changes ) {
      return { error: "Room not found", id: room.id }
    }
    
    // Return the updated room
    const getstmt = db.prepare( "SELECT * FROM rooms WHERE id = ?" )
    return getstmt.get( room.id )
  }

  // Insert new room
  const stmt = db.prepare( `
    INSERT INTO rooms (building_id, room_number, capacity, notes) 
    VALUES (?, ?, ?, ?)
  ` )
  
  const info = stmt.run( 
    room.building_id,
    room.room_number, 
    room.capacity || 1, 
    room.notes || "" 
  )
  
  room.id = Number( info.lastInsertRowid )
  
  return room
}

/**
 * Delete a room from database
 * @param { string } parsedurl
 * @param { string } method
 * @param { object } data
 * @return { Promise< object > }
 */
async function remove( parsedurl, method, data ) {
  const db = getdb()
  const id = parseInt( data.id )
  
  // Get room before deleting
  const getstmt = db.prepare( "SELECT * FROM rooms WHERE id = ?" )
  const room = getstmt.get( id )
  
  if( !room ) {
    return { error: "Room not found", id }
  }
  
  // Check for associated schedules
  const schedulesstmt = db.prepare( "SELECT COUNT(*) as count FROM schedules WHERE room_id = ?" )
  const result = schedulesstmt.get( id )
  
  if( result[ "count" ] > 0 ) {
    return { 
      error: "Cannot delete room with associated schedules", 
      id, 
      schedules_count: result[ "count" ],
      suggestion: "Delete or reassign schedules first"
    }
  }
  
  // Delete room
  const deletestmt = db.prepare( "DELETE FROM rooms WHERE id = ?" )
  const info = deletestmt.run( id )
  
  if( 0 === info.changes ) {
    return { error: "Failed to delete room", id }
  }
  
  return { success: true, removed: room }
}

module.exports = {
  get,
  add,
  remove
}