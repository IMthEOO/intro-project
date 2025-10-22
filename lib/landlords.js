const { getdb } = require( "./db" )

/**
 * @typedef { Object } landlord
 * @property { number } id
 * @property { string } name
 * @property { string } [ contact_email ]
 * @property { string } [ contact_phone ]
 * @property { string } [ notes ]
 */

/**
 * Get all landlords from database
 * @param { URL } parsedurl 
 * @returns { Promise< Array< landlord > > }
 */
async function get( parsedurl ) {
  const db = getdb()
  const stmt = db.prepare( "SELECT * FROM landlords ORDER BY name" )
  const landlords = stmt.all()
  return /** @type { Array< landlord > } */ ( landlords )
}

/**
 * Add or update a landlord in database
 * @param { string } parsedurl
 * @param { string } method
 * @param { landlord } landlord
 * @return { Promise< object > }
 */
async function add( parsedurl, method, landlord ) {
  const db = getdb()

  if( undefined !== landlord.id ) {
    // Update existing landlord
    const stmt = db.prepare( `
      UPDATE landlords 
      SET name = ?, contact_email = ?, contact_phone = ?, notes = ?
      WHERE id = ?
    ` )
    
    const info = stmt.run( 
      landlord.name, 
      landlord.contact_email || "", 
      landlord.contact_phone || "",
      landlord.notes || "", 
      landlord.id 
    )
    
    if( 0 === info.changes ) {
      return { error: "Landlord not found", id: landlord.id }
    }
    
    return landlord
  }

  // Insert new landlord
  const stmt = db.prepare( `
    INSERT INTO landlords (name, contact_email, contact_phone, notes) 
    VALUES (?, ?, ?, ?)
  ` )
  
  const info = stmt.run( 
    landlord.name, 
    landlord.contact_email || "", 
    landlord.contact_phone || "",
    landlord.notes || "" 
  )
  
  landlord.id = Number( info.lastInsertRowid )
  
  return landlord
}

/**
 * Delete a landlord from database
 * @param { string } parsedurl
 * @param { string } method
 * @param { object } data
 * @return { Promise< object > }
 */
async function remove( parsedurl, method, data ) {
  const db = getdb()
  const id = parseInt( data.id )
  
  // Get landlord before deleting
  const getstmt = db.prepare( "SELECT * FROM landlords WHERE id = ?" )
  const landlord = getstmt.get( id )
  
  if( !landlord ) {
    return { error: "Landlord not found", id }
  }
  
  // Check for associated buildings
  const buildingsstmt = db.prepare( "SELECT COUNT(*) as count FROM buildings WHERE landlord_id = ?" )
  const result = buildingsstmt.get( id )
  
  if( result[ "count" ] > 0 ) {
    return { error: "Cannot delete landlord with associated buildings", id, buildings_count: result[ "count" ] }
  }
  
  // Delete landlord
  const deletestmt = db.prepare( "DELETE FROM landlords WHERE id = ?" )
  const info = deletestmt.run( id )
  
  if( 0 === info.changes ) {
    return { error: "Failed to delete landlord", id }
  }
  
  return { success: true, removed: landlord }
}

module.exports = {
  get,
  add,
  remove
}