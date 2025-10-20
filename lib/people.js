/**
 * @typedef { Object } person
 * @property { number } id
 * @property { string } name - The name of the person.
 * @property { string } email - The email address of the person.
 * @property { string } [ notes ] - Additional notes about the person (optional).
 */

/**
 * @type { Array< person > }
 */
const people = [
  { id: 1, name: "Kermit Frog", email: "", notes: "" },
  { id: 2, name: "Miss Piggy", email: "", notes: "" },
];

/**
 * Demo function to return an array of people objects
 * @param { URL } parsedurl
 * @returns { Promise< Array< person > > }
 */
async function get(parsedurl) {
  return people;
}

/**
 * Demo function adding a person
 * @param { string } parsedurl
 * @param { string } method
 * @param { person } person
 * @return { Promise < object > }
 */
async function add(parsedurl, method, person) {
  if (undefined !== person.id) {
    // Update existing person
    const found = people.some((element) => {
      if (element.id == person.id) {
        element.name = person.name;
        element.email = person.email;
        element.notes = person.notes || "";
        return true;
      }
      return false;
    });

    if (!found) {
      return { error: "Person not found", id: person.id };
    }

    return person;
  }

  person.id =
    people.reduce((maxid, obj) => {
      return Math.max(maxid, obj.id);
    }, -Infinity) + 1;

  people.push(person);

  return person;
}

/**
 * Demo function to delete a person
 * @param { string } parsedurl
 * @param { string } method
 * @param { object } data
 * @return { Promise< object > }
 */
async function remove( parsedurl, method, data ) {
  const id = parseInt( data.id )
  
  const index = people.findIndex( p => p.id === id )
  
  if( -1 === index ) {
    return { error: "Person not found", id }
  }
  
  const removed = people.splice( index, 1 )[ 0 ]
  
  return { success: true, removed }
}


module.exports = {
  get,
  add,
  remove
};
