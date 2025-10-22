const people = require( "./people" )
const landlords = require( "./landlords" )
const buildings = require( "./buildings" )
const rooms = require( "./rooms" )

/**
 * Check for a valid API url call and handle.
 * @param { URL } parsedurl 
 * @param { object } res
 * @param { object } req
 * @param { object } receivedobj
 */
async function handleapi( parsedurl, res, req, receivedobj ) {

  const pathname = parsedurl.pathname

  const calls = {
    "/api/people": { 
      "GET": people.get, 
      "PUT": people.add,
      "DELETE": people.remove
    },
    "/api/landlords": { 
      "GET": landlords.get, 
      "PUT": landlords.add,
      "DELETE": landlords.remove
    },
    "/api/buildings": { 
      "GET": buildings.get, 
      "PUT": buildings.add,
      "DELETE": buildings.remove
    },
    "/api/rooms": { 
      "GET": rooms.get, 
      "PUT": rooms.add,
      "DELETE": rooms.remove
    }
  }

  if( !( pathname in calls ) || !( req.method in calls[ pathname ] ) ) {
    console.error( "404 file not found: ", pathname )
    res.writeHead( 404, { "Content-Type": "text/plain" })
    res.end( "404 - Not found" )
    return
  }

  try {
    const data = await calls[ pathname ][ req.method ]( parsedurl, req.method, receivedobj )

    res.writeHead( 200, { "Content-Type": "application/json" } )
    res.end( JSON.stringify( data ) )
  } catch( error ) {
    console.error( "Error handling API request:", error )
    res.writeHead( 500, { "Content-Type": "application/json" } )
    res.end( JSON.stringify( { error: "Internal server error", message: error.message } ) )
  }
}

module.exports = {
  handleapi
}