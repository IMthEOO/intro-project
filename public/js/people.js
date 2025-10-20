import { getdata, putdata } from "./api.js";
import {
  showform,
  getformfieldvalue,
  setformfieldvalue,
  clearform,
  gettablebody,
  cleartablerows,
} from "./form.js";
import { findancestorbytype } from "./dom.js";

document.addEventListener("DOMContentLoaded", async function () {
  document
    .getElementById("addperson")
    .addEventListener("click", addpersoninput);
  await gopeople();
});

/**
 *
 * @returns { Promise< object > }
 */
async function fetchpeople() {
  return await getdata("people");
}

/**
 * @param { string } name
 * @param { string } email
 * @param { string } notes
 * @returns { Promise< object > }
 */
async function addperson(name, email, notes) {
  await putdata("people", { name, email, notes });
}

/**
 *
 * @param { string } id
 * @param { string } name
 * @param { string } email
 * @param { string } notes
 * @returns { Promise< object > }
 */
async function updateperson(id, name, email, notes) {
  await putdata("people", { id, name, email, notes })
}

/**
 * @returns { Promise }
 */
async function gopeople() {
  const p = await fetchpeople();
  cleartablerows("peopletable");

  for (const pi in p) {
    addpersondom(p[pi]);
  }
}

/**
 *
 */
function addpersoninput() {
  clearform("personform");

  const form = document.getElementById( "personform" )
  delete form.dataset.personId
  
  showform("personform", async () => {
    await addperson(
      getformfieldvalue("personform-name"),
      getformfieldvalue("personform-email"),
      getformfieldvalue("personform-notes")
    );
    await gopeople();
  });
}

/**
 * @param { Event } ev
 */
function editperson(ev) {
  clearform("personform");

  const personrow = findancestorbytype(ev.target, "tr");

  console.log(personrow.email)

  setformfieldvalue("personform-name", personrow.person.name);
  setformfieldvalue( "personform-email", personrow.email )
  setformfieldvalue( "personform-notes", personrow.notes || "" )

  const form = document.getElementById( "personform" )
  form.dataset.personId = personrow.id

  showform( "personform", async () => {
    const personId = form.dataset.personId
    
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
function deleteperson( ev ) {
  const personrow = findancestorbytype( ev.target, "tr" )
  const person = personrow.person
  
  if( confirm( `Are you sure you want to delete ${person.name}?` ) ) {
    personrow.remove()
    
  }
}


/**
 *
 * @param { object } person
 */
export function addpersondom(person) {
  const table = gettablebody("peopletable");
  const newrow = table.insertRow();

  const cells = [];
  for (let i = 0; i < 2 + 7; i++) {
    cells.push(newrow.insertCell(i));
  }

  // @ts-ignore
  newrow.person = person;
  cells[0].innerText = person.name;

  const editbutton = document.createElement("button");
  editbutton.textContent = "Edit";
  editbutton.addEventListener("click", editperson);

  const deletebutton = document.createElement( "button" )
  deletebutton.textContent = "Delete"
  deletebutton.addEventListener( "click", deleteperson )
  deletebutton.style.backgroundColor = "#d43030"

  cells[8].appendChild(editbutton);
  cells[8].appendChild(deletebutton);
}
