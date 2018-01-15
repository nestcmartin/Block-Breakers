'use strict';

class Tetris {

	constructor(posX, posY, game) {

        this.arena = new Arena(posX, posY, nBlocksX, nBlocksY, this, game);
        this.player = new Tetromino(this, game);
        this.game = game;

        this.score = 0;
        this.level = 0;
        this.completedLines = 0;
        this.scoreIncrement = 50;

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
	    	if(this.level < 9) {
	        	this.loop.delay -= DROP_SPEEDUP;
	        	this.level++;
	    	}    	    	
	        
	        this.scoreIncrement += SCORE_BONUS;

	        audioManager.playSound(audioManager.levelSound);
	    }
	}

    updateUI() {
    	
	    scoreText.text = this.score;
	    linesText.text = this.completedLines;
	    this.updateTimer();
	}
};