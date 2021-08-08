import { Actor, HttpAgent } from "@dfinity/agent";
import {
  idlFactory as morpion_idl,
  canisterId as morpion_id,
} from "dfx-generated/morpion";

console.log(morpion_id);
console.log(morpion_idl);

const agent = new HttpAgent();
const morpion = Actor.createActor(morpion_idl, {
  agent,
  canisterId: morpion_id,
});

window.onbeforeunload = async (e) => {
  e.preventDefault(e);
  await morpion.ClearAll();
};

const container = document.querySelector(".container");
const cells = document.querySelectorAll(".cell");
const infos1 = document.querySelector(".infos1");
const infos2 = document.querySelector(".infos2");
const h1 = document.querySelector("h1");
const alone = document.querySelector("#alone");

let pseudo;
let whichPlayer;
let change = false;
let cellIndex;
let changeComplete;
let lookChange;
let turnwait;
let finDePartie = false;

const winningAlignments = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let thatGame = ["", "", "", "", "", "", "", "", ""];

async function checkStateGame() {
  let state = await morpion.stateOfGame();
  if (state) {
    alert(
      "A game is already taking place between two opponents, this is a simple app so it only supports two people playing at the same time. Come back later :)"
    );
  } else {
    pseudo = prompt("Welcome into this Game! Enter your name");
    envoyerPseudo(pseudo);
  }
}

async function envoyerPseudo(pseudo) {
  infos1.innerText = "Wait for an other player to connect...";
  let game = await morpion.addPlayer(pseudo);

  if (game) {
    alert("An other player has been found!");
    infos1.innerText = "";
    startGame();
  } else {
    launchRequest();
  }
}

async function launchRequest() {
  let search = setInterval(async () => {
    let ready = await morpion.numberPlayer();
    if (ready) {
      clearInterval(search);
      alert("An other player has been found!");
      infos1.innerText = "";
      startGame();
    }
  }, 3000);
}

async function startGame() {
  container.style.visibility = "visible";
  cells.forEach((cell) => {
    cell.style.visibility = "visible";
  });

  const playerOne = await morpion.player1();
  const playerTwo = await morpion.player2();

  whichPlayer = pseudo == playerOne ? 1 : 2;

  infos1.innerText = `${playerOne} is playing against ${playerTwo}, you are Player ${whichPlayer}`;

  if (whichPlayer == 1) {
    play();
  } else {
    wait();
  }
}

//////////////////////////////////// Game is starting !

function wait() {
  cells.forEach((cell) => {
    cell.removeEventListener("click", clickOnCell);
  });

  infos2.innerText =
    "Wait for the other player or for the game to understand it's over....";

  setTimeout(async () => {
    lookAtChange();
    checkResult();
    turnwait = setInterval(() => {
      if (change == false && whichPlayer == 1) {
        clearInterval(turnwait);
        clearInterval(lookChange);
        movementOtherPlayer(cellIndex);
        thatGame[cellIndex] = "O";
        cells[cellIndex].setAttribute("clicked", "true");
        checkResult();
        console.log(thatGame);
        infos2.innerText = "It is your turn to play";
        play();
      }

      if (change == true && whichPlayer == 2) {
        clearInterval(turnwait);
        clearInterval(lookChange);
        movementOtherPlayer(cellIndex);
        thatGame[cellIndex] = "X";
        cells[cellIndex].setAttribute("clicked", "true");
        checkResult();
        console.log(thatGame);
        infos2.innerText = "It is your turn to play";
        play();
      }
    }, 4000);
  }, 4000);
}

async function lookAtChange() {
  lookChange = setInterval(async () => {
    changeComplete = await morpion.isThereAChange();
    cellIndex = await changeComplete[0][1];
    change = await changeComplete[0][0];
  }, 3000);
}

async function play() {
  checkResult();
  infos2.innerText = "It is your turn to play";
  cells.forEach((cell) => {
    cell.addEventListener("click", clickOnCell);
  });
  return;
}

async function clickOnCell(e) {
  const cellClicked = e.target;
  const cellIndex = cellClicked.getAttribute("data-index");
  const a = cellClicked.getAttribute("clicked");

  if (a == "true") {
    return;
  }

  cells.forEach((cell) => {
    cell.removeEventListener("click", clickOnCell);
  });

  cellClicked.setAttribute("clicked", "true");

  infos2.innerText =
    "Wait for the other player or for the game to understand it's over....";

  if (whichPlayer == 1) {
    cells[cellIndex].innerText = "X";
    thatGame[cellIndex] = "X";

    await morpion.ImakeAChange(parseInt(cellIndex));
    infos2.innerText =
      "Wait for the other player or for the game to understand it's over....";

    wait();
  } else {
    cells[cellIndex].innerText = "O";
    thatGame[cellIndex] = "O";

    await morpion.ImakeAChange(parseInt(cellIndex));
    infos2.innerText =
      "Wait for the other player or for the game to understand it's over....";

    wait();
  }
}

function movementOtherPlayer(numeroCell) {
  if (whichPlayer == 1) {
    cells[numeroCell].innerText = "O";
    thatGame[numeroCell] = "O";
  }
  if (whichPlayer == 2) {
    cells[numeroCell].innerText = "X";
    thatGame[numeroCell] = "X";
  }

  return;
}

////

function checkResult() {
  for (let i = 0; i < winningAlignments.length; i++) {
    const checkWin = winningAlignments[i];

    let a = thatGame[checkWin[0]];
    let b = thatGame[checkWin[1]];
    let c = thatGame[checkWin[2]];

    if (a === "" || b === "" || c === "") {
      continue;
    }
    if (a === b && b === c) {
      finDePartie = true;
      break;
    }
  }

  if (finDePartie) {
    endOfGame();
  }

  let matchNul = !thatGame.includes("");
  if (matchNul) {
    endOfGame();
  }
}

function checkResultUpgraded() {
  for (let i = 0; i < winningAlignments.length; i++) {
    const checkWin = winningAlignments[i];
    //  [0, 1, 2],
    let a = thatGame[checkWin[0]];
    let b = thatGame[checkWin[1]];
    let c = thatGame[checkWin[2]];

    if (a === b && b === c && c == "X") {
      console.log("on est dans une bonne condition");
      return 1;
    }
    if (a === b && b === c && c == "O") {
      return 2;
    }
  }
  console.log("on ne devrait pas être là V2");
  return 3;
}

function endOfGame() {
  setTimeout(() => {
    console.log("Juste le temps de voir qu'on gagne/perd");
  }, 3500);

  let result = checkResultUpgraded();
  console.log(result);

  if (result == 3) {
    //Draw
    morpion.ClearAll();
    clearInterval(turnwait);
    clearInterval(lookChange);

    container.style.display = "none";
    cells.forEach((cell) => {
      cell.style.display = "none";
    });
    infos1.style.display = "none";
    infos2.style.display = "none";
    h1.innerText = "Draw ! Thanks for playing this game \n Sebastien.T ";
    return;
  } else if (result == 2 && whichPlayer == 1) {
    //Défaite du joueur 1
    morpion.ClearAll();
    clearInterval(turnwait);
    clearInterval(lookChange);

    container.style.display = "none";
    cells.forEach((cell) => {
      cell.style.display = "none";
    });
    infos1.style.display = "none";
    infos2.style.display = "none";
    h1.innerText = "You lost :( ! Thanks for playing this game \n Sebastien.T ";
    return;
  } else if (result == 2 && whichPlayer == 2) {
    //Victoire du joueur 2
    morpion.ClearAll();
    clearInterval(turnwait);
    clearInterval(lookChange);

    container.style.display = "none";
    cells.forEach((cell) => {
      cell.style.display = "none";
    });
    infos1.style.display = "none";
    infos2.style.display = "none";
    h1.innerText = "You won :) ! Thanks for playing this game \n Sebastien.T ";
    return;
  } else if (result == 1 && whichPlayer == 1) {
    //Victoire du joueur 1
    morpion.ClearAll();
    clearInterval(turnwait);
    clearInterval(lookChange);

    container.style.display = "none";
    cells.forEach((cell) => {
      cell.style.display = "none";
    });
    infos1.style.display = "none";
    infos2.style.display = "none";
    h1.innerText = "You won :) ! Thanks for playing this game \n Sebastien.T ";
    return;
  } else if (result == 1 && whichPlayer == 2) {
    //Défaite du joueur 2
    morpion.ClearAll();
    morpion.ClearAll();
    clearInterval(turnwait);
    clearInterval(lookChange);

    container.style.display = "none";
    cells.forEach((cell) => {
      cell.style.display = "none";
    });
    infos1.style.display = "none";
    infos2.style.display = "none";
    h1.innerText = "You lost :( ! Thanks for playing this game \n Sebastien.T ";
    return;
  }

  console.log("On ne devrait pas être ici");
  return;
}
//TODO : add an event listener if one user quits the game

window.onbeforeunload = async (e) => {
  e.preventDefault(e);
  await morpion.ClearAll();
};

checkStateGame();
