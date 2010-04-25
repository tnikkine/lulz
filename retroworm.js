gameArea = 35;
oneBiteIncreaseAmount = 8;
gameSpeed = 50;
wormbody = "worm";
food = "wormFood";
collision = "collision";
wormhole = "wormhole";
fadeSpeed = 400;
wormholeAppearRate = 80;
wormholeSpawnDistance = 8;
var wormholeRateCounter;
var nowPlaying;
var worm;
var updateRoutineId = 0;
var keyEventProcessed;

$(document).ready(function() {
  worm = new Worm();
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
  nowPlaying = true;
  $("#focus").focus();  // ahem.. how to set focus without a dummy field?
  $("#startButton").attr("disabled","disabled");
  $("#endMsg").slideUp(fadeSpeed);
  $("td").removeClass(wormbody).removeClass(food).removeClass(wormhole).removeClass(collision);
  worm.spawn();
  createWormFood();
  wormholeRateCounter = 0;
  updateRoutineId = setInterval(updateGame, gameSpeed);
}

function Worm() {
  this.spawn = function() {
    this.location = [];
    this.xDirection = 1;
    this.yDirection = 0;
    var boardCenter = Math.floor(gameArea / 2);
    this.location[0] = new Coord(boardCenter, boardCenter);
    this.head = this.location[0];
    this.size = 0;
    this.grow();
  };
  this.grow = function() {
    for (i=0; i<oneBiteIncreaseAmount; i++) {
      this.size++;
      this.location[this.size] = new Coord(-1,-1);
    }
    this.tail = this.location[this.size];
  };
  this.updatePosition = function() {
    for (i=this.size; i>0; i--) {
      this.location[i].x = this.location[i-1].x;
      this.location[i].y = this.location[i-1].y;
    }
    worm.head.x += worm.xDirection;
    worm.head.y += worm.yDirection;
  }
  this.draw = function() {
    $(worm.head.asBoardCoords()).addClass(wormbody);
    $(worm.tail.asBoardCoords()).removeClass(wormbody);
  }
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
  return ((worm.head.x < 1 || worm.head.x > gameArea -2) ||
       ((worm.head.y < 1) || worm.head.y > gameArea -2));
}

function wormCollision() {
  return ($(worm.head.asBoardCoords()).hasClass(wormbody))
}

function wormholeCollision() {
  return ($(worm.head.asBoardCoords()).hasClass(wormhole))
}

function createWormholes() {
  wormholeRateCounter++;
  if (wormholeRateCounter < wormholeAppearRate)
    return;
  createBoardElement(wormhole, wormholeSpawnDistance);

  wormholeRateCounter = 0;
}

function updateScore() {
  $("#score").html(worm.size - oneBiteIncreaseAmount);  // no score for the startup worm length  
}

function checkPlayStatus() {
  if (!nowPlaying) {
    $("#endMsg").slideDown(fadeSpeed);
    clearInterval(updateRoutineId);
  }
}

function createBoardElement(elementType, minimumDistanceFromHead) {
  // No elements over the worm or other existing elements
  var elementPosition = new Coord(getRandomCoordinate(), getRandomCoordinate());
  while ($(elementPosition.asBoardCoords()).attr("class") != "" ||
      (distanceFromHead(elementPosition) < minimumDistanceFromHead)) {
    elementPosition.setRandomCoordinates();
  }
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
}

function endGame() {
  $(worm.head.asBoardCoords()).addClass("collision").fadeTo(fadeSpeed, 0.3).fadeTo(fadeSpeed, 1);
  $("#startButton").removeAttr("disabled");
  nowPlaying = false;
}

function getRandomCoordinate() {
  return Math.floor(Math.random() * (gameArea -3)) + 1; // Playable game area excludes borders
}