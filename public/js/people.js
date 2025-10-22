import { getdata, putdata, deletedata } from "./api.js"
import { showform, getformfieldvalue, setformfieldvalue, clearform, gettablebody, cleartablerows } from "./form.js"
import { findancestorbytype } from "./dom.js"

document.addEventListener( "DOMContentLoaded", async function() {
  document.getElementById( "addperson" ).addEventListener( "click", addpersoninput )
  await gopeople()
} )

/**
 * @returns { Promise< object > }
 */
async function fetchpeople() {
  return await getdata( "people" )
}

/**
 * @param { string } name
 * @param { string } email
 * @param { string } notes
 * @returns { Promise< object > }
 */
async function addperson( name, email, notes ) {
  return await putdata( "people", { name, email, notes } )
}

/**
 * @param { number } id 
 * @param { string } name 
 * @param { string } email 
 * @param { string } notes 
 * @returns { Promise< object > }
 */
async function updateperson( id, name, email, notes ) {
  return await putdata( "people", { id, name, email, notes } )
}

/**
 * @returns { Promise }
 */
async function gopeople() {
  const p = await fetchpeople()
  cleartablerows( "peopletable" )

  for( const pi in p ) {
    addpersondom( p[ pi ] )
  }
}

/**
 * Show form for adding a new person
 */
function addpersoninput() {
  clearform( "personform" )
  
  // Remove any existing person ID data attribute
  const form = document.getElementById( "personform" )
  delete form.dataset.personId
  
  showform( "personform", async () => {
    await addperson( 
      getformfieldvalue( "personform-name" ), 
      getformfieldvalue( "personform-email" ), 
      getformfieldvalue( "personform-notes" ) 
    )
    await gopeople()
  } )
}

/**
 * Show form for editing an existing person
 * @param { Event } ev
 */
function editperson( ev ) {
  clearform( "personform" )
  
  const personrow = findancestorbytype( ev.target, "tr" )
  const person = personrow.person
  
  // Populate all form fields
  setformfieldvalue( "personform-name", person.name )
  setformfieldvalue( "personform-email", person.email )
  setformfieldvalue( "personform-notes", person.notes || "" )
  
  // Store the person ID in the form for later retrieval
  const form = document.getElementById( "personform" )
  form.dataset.personId = person.id
  
  showform( "personform", async () => {
    const personId = parseInt( form.dataset.personId )
    
    await updateperson( 
      personId,
      getformfieldvalue( "personform-name" ), 
      getformfieldvalue( "personform-email" ), 
      getformfieldvalue( "personform-notes" ) 
    )
    await gopeople()
  } )
}

/**
 * Delete a person after confirmation
 * @param { Event } ev
 */
async function deleteperson( ev ) {
  const personrow = findancestorbytype( ev.target, "tr" )
  const person = personrow.person
  
  if( confirm( `Are you sure you want to delete ${person.name}?` ) ) {
    try {
      await deletedata( "people", person.id )
      await gopeople()
    } catch( error ) {
      alert( "Failed to delete person. Please try again." )
      console.error( "Delete error:", error )
    }
  }
}

/**
 * Add a person row to the DOM table
 * @param { object } person
 */
export function addpersondom( person ) {
  const table = gettablebody( "peopletable" )
  const newrow = table.insertRow()

  const cells = []
  for( let i = 0; i < ( 2 + 7 ); i++ ) {
    cells.push( newrow.insertCell( i ) )
  }

  // Store person data on the row element
  // @ts-ignore
  newrow.person = person
  cells[ 0 ].innerText = person.name

  // Create action buttons container
  const actionCell = cells[ 8 ]
  
  const editbutton = document.createElement( "button" )
  editbutton.textContent = "Edit"
  editbutton.addEventListener( "click", editperson )
  editbutton.style.marginRight = "5px"
  
  const deletebutton = document.createElement( "button" )
  deletebutton.textContent = "Delete"
  deletebutton.addEventListener( "click", deleteperson )
  deletebutton.classList.value = "btn-danger"
  
  actionCell.appendChild( editbutton )
  actionCell.appendChild( deletebutton )
}