const boardContainer = document.querySelector(".board-container");

const GameController = (() => {
  let isKnightTurn = true;
  let knightLocation = null;
  let endLocation = [];

  const createBoard = () => {
    for (let i = 0; i < 8; i++) {
      const rowContainer = document.createElement("div");
      rowContainer.className = "board-row";
      rowContainer.id = i + "-row";
      boardContainer.appendChild(rowContainer);

      for (let j = 0; j < 8; j++) {
        const square = document.createElement("div");
        square.className = "board-square";
        square.id = "c" + j + "-" + "r" + i;
        rowContainer.appendChild(square);

        if (i % 2 == 0 && j % 2 == 0) {
          square.style.backgroundColor = "rgb(34, 34, 34)";
        } else if (i % 2 !== 0 && j % 2 !== 0) {
          square.style.backgroundColor = "rgb(34, 34, 34)";
        }
      }
    }

    const boardSquare = document.querySelectorAll(".board-square");

    boardSquare.forEach((square) => {
      square.addEventListener("click", clickHandler);
    });
  };

  function clickHandler(e) {
    if (isKnightTurn) {
      if (e.target.id === "knight") {
        return;
      } else if (knightLocation !== null) {
        const pastKnightSquare = document.querySelector("#" + knightLocation);
        pastKnightSquare.removeChild(pastKnightSquare.firstChild);
      }

      const squareStart = document.querySelector(".board-square-start");
      if (squareStart) {
        squareStart.className = "board-square";
      }

      e.target.className = "board-square-start";
      const knightPiece = document.createElement("img");
      knightPiece.className = "knight";
      knightPiece.id = "knight";
      knightPiece.src = "./Assets/chess-knight.svg";
      e.target.appendChild(knightPiece);
      knightLocation = e.target.id;
      console.log("knightLocation", knightLocation);
    } else {
      const squareEnd = document.querySelector(".board-square-end");
      if (squareEnd) {
        squareEnd.className = "board-square";
      }

      endLocation = e.target.id;
      e.target.className = "board-square-end";
      isKnightTurn = true;
    }
  }

  function placeEndClickHandler(e) {
    isKnightTurn = false;
  }

  function startClickHandler(e) {
    const squares = document.querySelectorAll(".board-square");
    squares.forEach((square) => (square.innerHTML = ""));
    knightMoves(knightLocation, endLocation);
  }

  return {
    createBoard,
    knightLocation,
    endLocation,
    placeEndClickHandler,
    clickHandler,
    startClickHandler,
  };
})();

function knightMoves(startLocation, endLocation) {
  let currentLocation = {
    x: parseInt(startLocation.charAt(1)),
    y: parseInt(startLocation.charAt(4)),
  };

  let finishLocation = {
    x: parseInt(endLocation.charAt(1)),
    y: parseInt(endLocation.charAt(4)),
  };

  let squaresVisited = [];
  let squaresToVisit = [];
  let distances = [];
  let previousPositions = [];

  console.log("starting location", currentLocation);
  console.log("ending Location", finishLocation);

  // Initialize the starting point
  squaresToVisit.push(currentLocation);
  distances[`${currentLocation.x},${currentLocation.y}`] = 0;
  console.log(distances);

  while (squaresToVisit.length > 0) {
    // Sort squaresToVisit based on the distance from the starting point
    squaresToVisit.sort(
      (a, b) => distances[`${a.x}-${a.y}`] - distances[`${b.x}-${b.y}`]
    );

    console.log("squares to visit:", squaresToVisit);

    // Get the square with the shortest distance
    const currentSquare = squaresToVisit.shift();

    console.log("current Square:", currentSquare);

    // Mark the square as visited
    squaresVisited.push(`${currentSquare.x}-${currentSquare.y}`);
    console.log("squares visited", squaresVisited);

    // Check if we reached the end location
    if (
      currentSquare.x === finishLocation.x &&
      currentSquare.y === finishLocation.y
    ) {
      console.log("found shortest path");
      const shortestPath = reconstructPath(previousPositions, currentSquare);
      console.log(shortestPath);
      //animate movement
      animateMove(shortestPath);
      break;
    }

    // Generate possible moves for the knight
    const possibleMoves = generateKnightMoves(currentSquare);
    console.log("possible Moves", possibleMoves);

    // Iterate over possible moves
    for (const move of possibleMoves) {
      const newPosition = {
        x: move.x,
        y: move.y,
      };

      console.log("new position", newPosition);

      const newPositionStr = `${newPosition.x}-${newPosition.y}`;

      console.log("new position string", newPositionStr);

      // Check if the new position is valid and has not been visited
      if (
        newPosition.x >= 0 &&
        newPosition.x < 8 &&
        newPosition.y >= 0 &&
        newPosition.y < 8 &&
        !squaresVisited.includes(newPositionStr)
      ) {
        // Calculate the new distance
        const newDistance = distances[`${newPosition.x}-${newPosition.y}`] + 1;
        console.log("new distance", newDistance);

        console.log("distances [newPositionstr]", distances[newPositionStr]);

        // Update the distance if it's shorter than the current recorded distance
        if (
          !distances.hasOwnProperty(newPositionStr) ||
          newDistance < distances[newPositionStr]
        ) {
          distances[newPositionStr] = newDistance;
          squaresToVisit.push(newPosition);

          //record the previous position for reconstructing the path
          previousPositions[
            newPositionStr
          ] = `${currentSquare.x}-${currentSquare.y}`;
        }
      }
    }
  }
}

function generateKnightMoves(currentLocation) {
  const moves = [
    { x: 2, y: 1 },
    { x: 2, y: -1 },
    { x: -2, y: 1 },
    { x: -2, y: -1 },
    { x: 1, y: 2 },
    { x: 1, y: -2 },
    { x: -1, y: 2 },
    { x: -1, y: -2 },
  ];

  return moves.map((move) => ({
    x: currentLocation.x + move.x,
    y: currentLocation.y + move.y,
  }));
}

function reconstructPath(previousPositions, currentSquare) {
  const path = [];
  let currentPosition = `${currentSquare.x}-${currentSquare.y}`;
  path.unshift(currentPosition);

  while (previousPositions[currentPosition]) {
    currentPosition = previousPositions[currentPosition];
    path.unshift(currentPosition);
  }

  return path;
}

function animateMove(shortestPath) {
  for (let i = 1; i < shortestPath.length; i++) {
    const shortestPathString = shortestPath[i];

    const square = document.querySelector(
      "#c" + shortestPathString[0] + "-" + "r" + shortestPathString[2]
    );
    square.innerHTML = i;
  }
}

GameController.createBoard();
