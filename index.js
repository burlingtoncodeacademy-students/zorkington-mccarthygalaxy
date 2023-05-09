const readline = require("readline");
const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
}

class Room {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.inventory = [];
    this.north = null;
    this.south = null;
    this.east = null;
    this.west = null;
  }

  addItem(item) {
    this.inventory.push(item); // pushes item to room inventory
  }

  removeItem(item) {
    const index = this.inventory.indexOf(item); // gets index of item from room inventory
    if (index > -1) {   // as long as room inventory array is not empty
      this.inventory.splice(index, 1); // splices the item from the this.inventory array starting with the item's index, then 1 item
    }
  }
}

class Item {
  constructor(name, description, takeable) {
    this.name = name;
    this.description = description;
    this.takeable = takeable;
  }
}

// -------------------------------------------------------- Create new Room(s) --------------------------------------------------- >

const foyer = new Room(
  "Foyer",
  "You are in a grand foyer with a beautiful chandelier hanging from the ceiling. There is a living room to the north and a kitchen east of the living room."
);

const livingRoom = new Room(
  "Living Room",
  "You are in a cozy living room with a fireplace and comfortable chairs. To the south is the Foyer. To the east is the Kitchen."
);

const kitchen = new Room(
  "Kitchen",
  "You are in a spacious kitchen with modern appliances and granite countertops. To the east is the Conservatory. To the west is the Living Room."
);

const conservatory = new Room(
  "Conservatory",
  "You are in a conservatory with lots of stained glass and pebbled windows. There are many plants, flowers, and even a few trees in huge pots. To the west is the kitchen."
);

// -------------------------------------------------------- Create new Item(s) --------------------------------------------------- >

const note = new Item(
  "Note",
  "A piece of paper with some writing on it.",
  true
);
const screwdriver = new Item(
  "Screwdriver",
  "A tool with a flat head and a magnetic tip.",
  true
);
const key = new Item(
  "Key", 
  "A shiny metal key.", 
  true
);
const brooch = new Item(
  "Brooch",
  "A delicate gold filigree brooch in the shape of a leaf with green accents.",
  true
);
const mirror = new Item(
  "Mirror",
  "A silver cracked mirror.", 
  false
);


// -------------------------------------------------------- Push new Item(s) to rooms --------------------------------------------- >

foyer.addItem(note);
livingRoom.addItem(screwdriver);
kitchen.addItem(key);
conservatory.addItem(brooch);
conservatory.addItem(mirror);


// ----------------------------------------------------- "Map" of Valid Directions ------------------------------------------------ >

foyer.north = livingRoom;  // adds to foyer this.north value A) north exists and B) livingRoom is north of foyer
livingRoom.south = foyer;   // adds to livingRoom this.south value A) south exists and B) foyer is south of livingRoom
livingRoom.east = kitchen;    // adds to livingRoom this.east value A) east exists and B) kitchen is east of livingRoom
kitchen.east = conservatory;  //  adds to kitchen this.east value A) east exists and B) conservatory is east of kitchen
kitchen.west = livingRoom;    //  adds to kitchen this.west value A) west exists and B)livingRoom is west of kitchen
conservatory.west = kitchen;  //  adds to conservatory this.west value A) west exists and B) kitchen is west of conservatory


// --------------------------------------- Assign and Reset Player Inventory Array to Nothing  ------------------------------------ >

let playerInventory = [];

// -------------------------------------------------------- Game Loop ------------------------------------------------------------- >

async function game() {
  let currentRoom = foyer; // Game start - Assigns currentRoom variable and sets to foyer (instance of Room class)

  console.log(`${currentRoom.name.toUpperCase()}\n${currentRoom.description}`); //  gets .description from instance of Room class
  console.log(`Directions: ${getValidDirections(currentRoom).join(", ").toUpperCase()}`); // calls f using (currentRoom), tells which ways you can move
  // joins these [from an obj/array] separated by ", "
  while (true) {
    let input = await ask(">_");
    input = input.toLowerCase().trim(); // makes lowercase and removes white space on either side of input
    const inputArr = input.split(" "); // creates inputArr and .splits each word as values therein
    const action = inputArr[0]; // first word )value of inputArr) is the ACTION
    const target = inputArr.slice(1).join(" "); // second word {or words!} (value of inputArr) is the TARGET

    if (action === "quit" || action === "exit") {                // begin examination of ACTION
      console.log("Thanks for playing!");
      process.exit();
    } else if (action === "look") {
      console.log(currentRoom.name.toUpperCase());
      console.log(currentRoom.description);
      console.log(`Directions: ${getValidDirections(currentRoom) // Show exits from currentRoom using array from getValidDirections function
        .join(", ").toUpperCase()}`);                                           // concatenating with ", " into a string. 
      console.log(
        `The room contains a: ${currentRoom.inventory
          .map((i) => i.name) // map iterates arrow function that gets .name value of every `i` argument
          .join(", ")}`
      ); // Show items here
      //FIXME:  ^^ NEED LOGIC: IF ROOM INVENTORY IS EMPTY, DON'T LIST THE 'CONTAINS' STATEMENT. ^^ //
    } else if (action === "take" || action === "get") {   //* could also use: `if (["take", "get"].includes(action)) {`
      const foundItem = currentRoom.inventory.find(    // compares item if in currentRoom.inventory using FIND method
        (i) => i.name.toLowerCase() === target        // using the .tolowerCase
      ); 
      if (foundItem && foundItem.takeable) {  // if foundItem exists && foundItem has a .takeable truthy value (not null, undefined, NaN, 0)
        currentRoom.removeItem(foundItem); // removeItem method of Room to avoid case sensitivity in user input
        playerInventory.push(foundItem); // pushes item to playerInventory (not a declared method)
        console.log(`You picked up the ${foundItem.name}.`);
        console.log(
          `Intial examination of the ${foundItem.name} reveals: ${foundItem.description}`
        );
      } else {
        console.log(`You can't take the ${target}.`);
      }
    } else if (action === "inventory" || action === "i") {
      console.log(
        `Inventory: ${playerInventory.map((things) => things.name).join(", ")}` // map() over playerInventory; map returns a new array of .name (s)
      );  // Concatenates the playerInventory arr into a string with ", " separators
    } else if (action === "drop") {
      const itemTBDr = playerInventory.find(
        (i) => i.name.toLowerCase() === target
      );
      if (itemTBDr) { // in this case, checks if `item` exists i.e. is not falsey (null, undefined, NaN, 0) "if `item` exists {then..."
        currentRoom.addItem(itemTBDr);
        playerInventory = playerInventory.filter((i) => i !== itemTBDr); // .filter on playerInventory, weeding out values that === the item
        console.log(`You dropped ${itemTBDr.name}.`);
      } else {
        console.log(`You don't have ${target} in your inventory.`);
      }
    } else if (action === "help") { // HELP Menu gives list of all commands and how to use them. //
      console.log(
        "You can use the following commands: \n- look: to look around the room\n- take [item]: to pick up an item\n- drop [item]: to drop an item\n- inventory: to see your inventory\n- north/south/east/west: to move in that direction\n- help: to display this help message\n- quit: to quit the game"
      );
    } else if (action === "north" && currentRoom.north) { // if action is `north` and currentRoom.north (exists) then {}
      currentRoom = currentRoom.north; // assign the value inside currentRoom.north to currentRoom 
      console.log(currentRoom.name.toUpperCase());
      console.log(currentRoom.description);
      console.log(`Directions: ${getValidDirections(currentRoom).join(", ").toUpperCase()}`); //
    } else if (action === "south" && currentRoom.south) {
      currentRoom = currentRoom.south;
      console.log(currentRoom.name.toUpperCase());
      console.log(currentRoom.description);
      console.log(`Directions: ${getValidDirections(currentRoom).join(", ").toUpperCase()}`); //
    } else if (action === "east" && currentRoom.east) {
      currentRoom = currentRoom.east;
      console.log(currentRoom.name.toUpperCase());
      console.log(currentRoom.description);
      console.log(`Directions: ${getValidDirections(currentRoom).join(", ").toUpperCase()}`); //
    } else if (action === "west" && currentRoom.west) {
      currentRoom = currentRoom.west;
      console.log(currentRoom.name.toUpperCase());
      console.log(currentRoom.description);
      console.log(`Directions: ${getValidDirections(currentRoom).join(", ").toUpperCase()}`); //
      //FIXME: NEED ANOTHER OPTION FOR MESSAGE IF INVALID DIRECTION IS INPUT RATHER THAN GENERIC ERROR //
    } else {
      console.log("Invalid command, type 'help' for a list of commands.");
    }
  }
}

game();

function getValidDirections(room) {
  let validDirections = []; // resets obj every time, then fills with updated valid directions
  if (room.north) {         // if room.north has a valid value (other than null, undefined, 0, NaN) then: 
    validDirections.push("north");
  }
  if (room.south) {         // if room.south has a valid value (other than null, undefined, 0, NaN) then:
    validDirections.push("south");
  }
  if (room.east) {          // if room.east has a valid value (other than null, undefined, 0, NaN) then:
    validDirections.push("east");
  }
  if (room.west) {          // if room.west has a valid value (other than null, undefined, 0, NaN) then:
    validDirections.push("west");
  }
  return validDirections;   // returns an array with all possible exits from current room
}
