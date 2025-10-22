const { getdb } = require( "./db" )

/**
 * @typedef { Object } person
 * @property { number } id
 * @property { string } name - The name of the person.
 * @property { string } email - The email address of the person.
 * @property { string } [ notes ] - Additional notes about the person (optional).
 */

/**
 * Get all people from database
 * @param { URL } parsedurl 
 * @returns { Promise< Array< person > > }
 */
async function get( parsedurl ) {
  const db = getdb()
  const stmt = db.prepare( "SELECT * FROM people ORDER BY name" )
  const people = stmt.all()
  // @ts-ignore
  return people
}

/**
 * Add or update a person in database
 * @param { string } parsedurl
 * @param { string } method
 * @param { person } person
 * @return { Promise< object > }
 */
async function add( parsedurl, method, person ) {
  const db = getdb()

  if( undefined !== person.id ) {
    // Update existing person
    const stmt = db.prepare( `
      UPDATE people 
      SET name = ?, email = ?, notes = ?
      WHERE id = ?
    ` )
    
    const info = stmt.run( 
      person.name, 
      person.email, 
      person.notes || "", 
      person.id 
    )
    
    if( 0 === info.changes ) {
      return { error: "Person not found", id: person.id }
    }
    
    return person
  }

  // Insert new person
  const stmt = db.prepare( `
    INSERT INTO people (name, email, notes) 
    VALUES (?, ?, ?)
  ` )
  
  const info = stmt.run( 
    person.name, 
    person.email, 
    person.notes || "" 
  )
  
  person.id =  Number(info.lastInsertRowid)
  
  return person
}

/**
 * Delete a person from database
 * @param { string } parsedurl
 * @param { string } method
 * @param { object } data
 * @return { Promise< object > }
 */
async function remove( parsedurl, method, data ) {
  const db = getdb()
  const id = parseInt( data.id )
  
  // Get person before deleting for response
  const getstmt = db.prepare( "SELECT * FROM people WHERE id = ?" )
  const person = getstmt.get( id )
  
  if( !person ) {
    return { error: "Person not found", id }
  }
  
  // Delete person
  const deletestmt = db.prepare( "DELETE FROM people WHERE id = ?" )
  const info = deletestmt.run( id )
  
  if( 0 === info.changes ) {
    return { error: "Failed to delete person", id }
  }
  
  return { success: true, removed: person }
}

module.exports = {
  get,
  add,
  remove
}