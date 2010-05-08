var gameArea = 40;
var oneBiteLengthIncreaseAmount = 3;
var gameUpdateFrequency = 70;
var wormbody = "worm";
var food = "wormFood";
var collision = "collision";
var wormhole = "wormhole";
var fadeSpeed = 400;
var wormholeAppearRate = 70;
var wormholeSpawnDistance = 8;
var wormholeRateCounter;
var currentlyPlaying;
var worm;
var updateRoutineId = 0;
var keyEventProcessed;

$(document).ready(function() {
  initializeButtons();
  bindKeys();
  buildGameArea();
  startNewGame();
});

function initializeButtons() {
  $("#startButton").bind("click", function () {
     startNewGame();
   });
}

function bindKeys() {
  $(document).keydown(function(event) {
    if (!keyEventProcessed) //
      return;
    switch(event.keyCode) {
      case 37: case 65:  // A or left-key
        if (worm.xDirection != 1) {
          worm.xDirection = -1;
          worm.yDirection = 0;
        }
        break;
      case 68: case 39:  // D or right-key
        if (worm.xDirection != -1) {
          worm.xDirection = 1;
          worm.yDirection = 0;
        }
        break;
      case 87: case 38:  // W or up-key
        if (worm.yDirection != 1) {
          worm.xDirection = 0;
          worm.yDirection = -1;
        }
        break;
      case 83: case 40:  // S or down-key
        if (worm.yDirection != -1) {
          worm.xDirection = 0;
          worm.yDirection = 1;
        }
      break;
    }
    keyEventProcessed = false;
  });
}

function buildGameArea() {
  for (y=0; y<gameArea; y++) {
    $("#gameboard").append("<tr>");
     for (x=0; x<gameArea; x++) {
       $("#gameboard tr:last").append("<td id='" + x + "_" + y + "'></td>");
       if (x == 0 || x == gameArea -1 || y == 0 || y == gameArea -1)
        $("#gameboard td:last").addClass("border");
     }
    $("#gameboard").append("</tr>");
  }
}

function startNewGame() {
  currentlyPlaying = true;
  $("#focus").focus();
  $("#startButton").attr("disabled","disabled");
  $("#endMsg").slideUp(fadeSpeed);
  $("td").removeClass(wormbody).removeClass(food).removeClass(wormhole).removeClass(collision);
  worm = new Worm();
  createWormFood();
  wormholeRateCounter = 0;
  updateRoutineId = setInterval(updateGame, gameUpdateFrequency);
}

function Worm() {
  this.spawn = function() {
    this.location = [];
    this.xDirection = 1;
    this.yDirection = 0;
    var boardCenter = Math.floor(gameArea / 2);
    this.location[0] = new Coord(boardCenter, boardCenter);
    this.head = this.location[0];
    this.grow();
  };
  this.grow = function() {
    var i = oneBiteLengthIncreaseAmount;
    while (i--) {
      this.location.push(new Coord(-1,-1));
    }
  };
  this.updatePosition = function() {
    this.location.pop();
    this.location.splice(0, 0, new Coord(worm.head.x + worm.xDirection, worm.head.y + worm.yDirection));
    worm.head = this.location[0];
    this.tail = this.location[this.location.length - 1];
  }
  this.draw = function() {
    $(worm.head.asBoardCoords()).addClass(wormbody);
    $(worm.tail.asBoardCoords()).removeClass(wormbody);
  }
  this.spawn();
}

function updateGame() {
  worm.updatePosition();
  checkForCollisions();
  worm.draw();
  checkForFood();
  createWormholes();
  updateScore();
  checkPlayStatus();
  keyEventProcessed = true;
}

function checkForFood() {
  if ($(worm.head.asBoardCoords()).hasClass(food)) {
    $(worm.head.asBoardCoords()).removeClass(food);
    worm.grow();
    createWormFood();
  }
}

function createWormFood() {
  var wormFoodPosition = createBoardElement(food, 0);
  $(wormFoodPosition.asBoardCoords()).fadeTo(fadeSpeed, 0.5).fadeTo(fadeSpeed, 1);
}

function checkForCollisions() {
  if (wormCollision() || borderCollision() || wormholeCollision())
    endGame();
}

function borderCollision() {
  return (worm.head.x < 1 || worm.head.x > gameArea -2 ||
        worm.head.y < 1 || worm.head.y > gameArea -2);
}

function wormCollision() {
  return ($(worm.head.asBoardCoords()).hasClass(wormbody))
}

function wormholeCollision() {
  return ($(worm.head.asBoardCoords()).hasClass(wormhole))
}

function createWormholes() {
  wormholeRateCounter++;
  if (wormholeRateCounter > wormholeAppearRate) {
    createBoardElement(wormhole, wormholeSpawnDistance);
    wormholeRateCounter = 0;
  }
}

function updateScore() {
  $("#score").html(worm.location.length - 1 - oneBiteLengthIncreaseAmount);  // no score for the startup worm length
}

function checkPlayStatus() {
  if (!currentlyPlaying) {
    $("#endMsg").slideDown(fadeSpeed);
    clearInterval(updateRoutineId);
  }
}

function createBoardElement(elementType, minimumDistanceFromHead) {
  // No elements over the worm or other existing elements
  var elementPosition = new Coord(0,0);
  do {
    elementPosition.setRandomCoordinates();
  } while (elementPosition.hasAnyClass() || (distanceFromHead(elementPosition) < minimumDistanceFromHead))
  $(elementPosition.asBoardCoords()).addClass(elementType);
  return elementPosition;
}

function distanceFromHead(elementPosition) {
  var distanceSquared = Math.pow((elementPosition.x - worm.head.x),2) + Math.pow((elementPosition.y - worm.head.y),2);
  return Math.floor(Math.sqrt(distanceSquared));
}

function Coord(newX, newY) {
  this.x = newX;
  this.y = newY;

  this.setRandomCoordinates = function() {
    this.x = getRandomCoordinate();
    this.y = getRandomCoordinate();
  }
  this.asBoardCoords = function() {
    return ("#" + this.x + "_" + this.y);
  }
  this.hasAnyClass = function () {
    return $(this.asBoardCoords()).attr("class") != "";
  }
}

function endGame() {
  $(worm.head.asBoardCoords()).addClass("collision").fadeTo(fadeSpeed, 0.3).fadeTo(fadeSpeed, 1);
  $("#startButton").removeAttr("disabled");
  currentlyPlaying = false;
}

function getRandomCoordinate() {
  return Math.floor(Math.random() * (gameArea -3)) + 1; // Playable game area excludes borders
}