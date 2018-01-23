'use strict';

var PIECES = 'ILJOTSZB';
var QUEUE_SIZE = 2;
var DROP_TIME = Phaser.Timer.SECOND;
var DROP_SPEEDUP = 90;
var SCORE_INCREMENT = 50;
var SCORE_BONUS = 25;
var LINES_THRESHOLD = 10;
var MAX_LEVEL = 9;

class Tetris {

	constructor(posX, posY, game) {

		// Game Objects
        this.arena = new Arena(posX, posY, BLOCKS_X, BLOCKS_Y, this, game);
        this.player = new Tetromino(this, game);
        this.game = game;
        
        // Variables
        this.scoreIncrement = SCORE_INCREMENT;
        this.completedLines = 0;
        this.score = 0;
        this.level = 0;
        this.linesText;
        this.scoreText;        

        // Timer
        this.moveTimer = 0; 
        this.initTimer();
    }

    initTimer() {
    	this.timer = this.game.time.events;
        this.loop = this.timer.loop(this.player.dropInterval, this.player.drop, this.player);
        this.timer.start();
    }

	updateTimer() {

	    if(this.completedLines % LINES_THRESHOLD === 0) 
	    {
	    	if(this.level < MAX_LEVEL) {
	        	this.loop.delay -= DROP_SPEEDUP;
	        	this.level++;
	    	}    	    	
	        
	        this.scoreIncrement += SCORE_BONUS;

	        audioManager.playSound(audioManager.levelSound);
	    }
	}

    updateUI() {
    	
	    this.scoreText.text = this.score;
	    this.linesText.text = this.completedLines;
	    this.updateTimer();
	}

	selectLevel(level) {

		this.level = level;
		
		for(let i = 0; i < level; i++)
		{
	        this.loop.delay -= DROP_SPEEDUP;
	        this.scoreIncrement += SCORE_BONUS;
		}
	}
};