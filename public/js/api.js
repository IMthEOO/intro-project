

const rooturl = `${window.location.protocol}//${window.location.host}/api/`

/**
 * Wrapper for all API GET requests
 * @param { string } api 
 * @returns { Promise< object > }
 */
export async function getdata( api ) {
  try {
    const url = rooturl + api

    const response = await fetch( url )

    if( response.ok ) {
      const data = await response.json()
      return data
    } else {
      throw new Error( `Request failed with status: ${response.status}` )
    }
  } catch (error) {
    console.error( 'Error fetching data:', error.message )
  }
}

/**
 * Wrapper for all API PUT requests
 * @param { string } api
 * @param { object } data
 * @returns { Promise< object > }
 */
export async function putdata( api, data ) {
  try {
    const request = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify( data )
    }

    const url = rooturl + api
    const response = await fetch( url, request )
    
    if( response.ok ) {
      const result = await response.json()
      return result
    } else {
      throw new Error( `Request failed with status: ${response.status}` )
    }
  } catch( error ) {
    console.error( "Error putting data:", error.message )
    throw error
  }
}

/**
 * Wrapper for all API DELETE requests
 * @param { string } api
 * @param { number } id
 * @returns { Promise< object > }
 */
export async function deletedata( api, id ) {
  try {
    const request = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify( { id } )
    }

    const url = rooturl + api
    const response = await fetch( url, request )
    
    if( response.ok ) {
      const result = await response.json()
      return result
    } else {
      throw new Error( `Request failed with status: ${response.status}` )
    }
  } catch( error ) {
    console.error( "Error deleting data:", error.message )
    throw error
  }
}


