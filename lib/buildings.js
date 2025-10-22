const { getdb } = require( "./db" )

/**
 * @typedef { Object } building
 * @property { number } id
 * @property { number } landlord_id
 * @property { string } name
 * @property { string } [ address ]
 * @property { string } [ notes ]
 * @property { string } [ landlord_name ]
 */

/**
 * Get all buildings from database with landlord info
 * @param { URL } parsedurl 
 * @returns { Promise< Array< building > > }
 */
async function get( parsedurl ) {
  const db = getdb()
  const stmt = db.prepare( `
    SELECT 
      b.*,
      l.name as landlord_name
    FROM buildings b
    LEFT JOIN landlords l ON b.landlord_id = l.id
    ORDER BY b.name
  ` )
  const buildings = stmt.all()
  return /** @type { Array< building > } */ ( buildings )
}

/**
 * Add or update a building in database
 * @param { string } parsedurl
 * @param { string } method
 * @param { building } building
 * @return { Promise< object > }
 */
async function add( parsedurl, method, building ) {
  const db = getdb()

  // Validate landlord exists
  const landlordstmt = db.prepare( "SELECT id FROM landlords WHERE id = ?" )
  const landlord = landlordstmt.get( building.landlord_id )
  
  if( !landlord ) {
    return { error: "Landlord not found", landlord_id: building.landlord_id }
  }

  if( undefined !== building.id ) {
    // Update existing building
    const stmt = db.prepare( `
      UPDATE buildings 
      SET landlord_id = ?, name = ?, address = ?, notes = ?
      WHERE id = ?
    ` )
    
    const info = stmt.run( 
      building.landlord_id,
      building.name, 
      building.address || "", 
      building.notes || "", 
      building.id 
    )
    
    if( 0 === info.changes ) {
      return { error: "Building not found", id: building.id }
    }
    
    return building
  }

  // Insert new building
  const stmt = db.prepare( `
    INSERT INTO buildings (landlord_id, name, address, notes) 
    VALUES (?, ?, ?, ?)
  ` )
  
  const info = stmt.run( 
    building.landlord_id,
    building.name, 
    building.address || "", 
    building.notes || "" 
  )
  
  building.id = Number( info.lastInsertRowid )
  
  return building
}

/**
 * Delete a building from database
 * @param { string } parsedurl
 * @param { string } method
 * @param { object } data
 * @return { Promise< object > }
 */
async function remove( parsedurl, method, data ) {
  const db = getdb()
  const id = parseInt( data.id )
  
  // Get building before deleting
  const getstmt = db.prepare( "SELECT * FROM buildings WHERE id = ?" )
  const building = getstmt.get( id )
  
  if( !building ) {
    return { error: "Building not found", id }
  }
  
  // Check for associated rooms
  const roomsstmt = db.prepare( "SELECT COUNT(*) as count FROM rooms WHERE building_id = ?" )
  const result = roomsstmt.get( id )
  
  if( result[ "count" ] > 0 ) {
    return { error: "Cannot delete building with associated rooms", id, rooms_count: result[ "count" ] }
  }
  
  // Delete building
  const deletestmt = db.prepare( "DELETE FROM buildings WHERE id = ?" )
  const info = deletestmt.run( id )
  
  if( 0 === info.changes ) {
    return { error: "Failed to delete building", id }
  }
  
  return { success: true, removed: building }
}

module.exports = {
  get,
  add,
  remove
}