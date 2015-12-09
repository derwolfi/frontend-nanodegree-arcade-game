/**
 * constant
 */
var TILE_WIDTH = 101,
    TILE_HEIGHT = 83,
    TILE_START = 50;


var Entity = function() {
    this.row = {
        '1': TILE_START,
        '2': TILE_START + TILE_HEIGHT,
        '3': TILE_START + (2 * TILE_HEIGHT)
    };
};

// Draw the Element on the screen, required method for game
Entity.prototype.render = function() {
    if(player.playing) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};
/**
* Enemies our player must avoid
* @param {number} row - starts with line .. default 1
* @param {number} speed - starts with speed .. default 1
*/
var Enemy = function(row,speed) {
    /**
    * Variables applied to each of our instances go here,
    * we've provided one for you to get started
    *
    * The image/sprite for our enemies, this uses
    * a helper we've provided to easily load images
    */
    Entity.call(this);
    this.sprite = 'images/enemy-bug.png';
    this.x = 0;
    this.y = this.row[row] || this.row[1];
    this.speed = speed || 1;

};
Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

/**
* Update the enemy's position, required method for game
* Parameter: dt, a time delta between ticks
*/
Enemy.prototype.update = function(dt) {
    /**
     * You should multiply any movement by the dt parameter
     * which will ensure the game runs at the same speed for
     * all computers.
     * Enemies runs from left (-100) to right (600) then set new speed
     */
    if(this.x < 600) {
        this.x += TILE_WIDTH * (dt * this.speed);
    } else {
        this.speed = getRandomInt(1,3);
        this.y = this.row[getRandomInt(1,3)];
        this.x = -100;
    }
};

/**
 * a Player
 * interacts with HTML-Tags (Score, Level, Select a Player, Lives)
 *
 */
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.x = 2 * TILE_WIDTH;
    this.y = TILE_START + (4 * TILE_HEIGHT);
    this.score = 0;
    this.level = 1;
    this.playing = false;
    this.lives = 0;
    this.collidedEnemy = false;
    this.collidedGem = false;
    this.scoreElement = document.querySelector('#score');
    this.levelElement = document.querySelector('#level');
    this.selectPlayerForm = document.querySelector('#selectPlayer');
    this.selectPlayer = this.selectPlayerForm.querySelector('select');
    this.selectedPlayer = document.querySelector('#selectedPlayer');
    this.livesElement = this.selectedPlayer.querySelector('em');
    this.playerElement = this.selectedPlayer.querySelector('img');
};
Player.prototype = Object.create(Entity.prototype);

/** update the Player and the Level, set gem active
 * update the HTML-Tags (Score, Level, Lives)
 */
Player.prototype.update = function() {
    // Update the Level
    switch(true) {
        case (this.score < 10):
            this.level = 1;
            break;
        case (this.score < 50):
            this.level = 2;
            break;
        case (this.score < 100):
            this.level = 3;
            break;
    }
    if(this.score > 3 && !gem.active){
        gem.active = true;
        gem.show = true;
        gem.showHide();
    }
    this.scoreElement.innerHTML = 'Score: ' + this.score;
    this.levelElement.innerHTML = 'Level: ' + this.level;
    this.livesElement.innerHTML = 'Lives: ' + this.lives;
    this.playerElement.src = this.sprite;
};


// where to got left, up, down or right
Player.prototype.handleInput = function(keycode) {
    var move = {
        'left': - TILE_WIDTH,
        'right': TILE_WIDTH,
        'up': - TILE_HEIGHT,
        'down': TILE_HEIGHT
    };
    if (keycode === 'up' || keycode === 'down') {
        if( ( this.y + move[keycode] >= 50 ) && ( this.y + move[keycode] <= 382 )) {
            this.y += move[keycode];
        } else if (this.y + move[keycode] < 50 ) { // Update the Score if Player jump into the water.
            this.y = 382;
            this.x = 202;
            this.score += 1;
        }
    } else if (keycode === 'left' || keycode === 'right') {
        if( ( this.x + move[keycode] >= 0 ) && ( this.x + move[keycode] <= 404 ) ) {
            this.x += move[keycode];
        }
    }
};

/**
 * Gem Class for Bonus Points.
 */
var Gem = function() {
    Entity.call(this);
    this.sprites = {
        '1': {
                'gem': 'images/Gem-Blue.png',
                'bonus': 2
            },
        '2': {
                'gem': 'images/Gem-Green.png',
                'bonus': 4
            },
        '3': {
                'gem': 'images/Gem-Orange.png',
                'bonus': 6
            },
        '4': {
                'gem': 'images/Heart.png',
                'bonus': 8
            },
        '5': {
                'gem': 'images/Key.png',
                'bonus': 10
            },
        '6': {
                'gem': 'images/Star.png',
                'bonus': 12
            },
        '7': {
                'gem': 'images/Selector.png',
                'bonus': 14
            }
    };
    this.activeGem = this.sprites[1].gem;
    this.active = false;
    this.bonus = 1;
    this.show = false;
    this.x = TILE_WIDTH;
    this.y = TILE_START + (2 * TILE_HEIGHT);
};

// render the Gem
Gem.prototype.render = function() {
    if(player.playing && this.active && this.show) {
        ctx.drawImage(Resources.get(this.activeGem), this.x, this.y);
    }
};

/*
 * Displays a random Gem and hides it when no collision with the player happens
 */
Gem.prototype.showHide = function() {
    // set new position for a new Gem.
    var size = Object.keys(gem.sprites).length, // object size
        number = getRandomInt(1,size); // get a random Number
    this.x = 101 * getRandomInt(0,4); // set x position
    this.y = this.row[getRandomInt(1,3)]; // set y position
    this.activeGem = this.sprites[number].gem; // set gem
    this.bonus = this.sprites[number].bonus; // set bonus
    player.collidedGem = false;
    setTimeout(function(){
        gem.render();
        gem.show = false;
        setTimeout(function() {
            gem.showHide();
            gem.show = true;
        }, 5000);
    }, 10000);
};

/**
* Now instantiate your objects.
* Place all enemy objects in an array called allEnemies
* Place the player object in a variable called player
*/
var gem = new Gem();
var allEnemies = [];
var player = new Player();


/**
 * Start the Game
 * Create Enemies, Player Settings
 */
function startGame() {
    allEnemies = [new Enemy(1,2), new Enemy(2,1), new Enemy(3,3)];
    player.playing = true;
    player.lives = 3;
    player.selectPlayerForm.style.display = 'none';
    player.livesElement.style.display = 'block';
    player.scoreElement.style.display = 'block';
    player.levelElement.style.display = 'block';
    this.style.display = 'none'; // Hide startbutton.
}



/**
* This listens for key presses and sends the keys to your
* Player.handleInput() method. You don't need to modify this.
*/
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

/**
 * Returns a random integer between min (included) and max (included)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
