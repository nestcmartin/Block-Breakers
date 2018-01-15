'use strict';

var GameoverScene = {

	preload: function()	{
    	this.game.load.spritesheet('exit', 'assets/exit.png', 137, 37);
	},

	create: function () {
		this.background = this.game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background')
		this.backgroundv = 5;

		this.gameOverText = this.game.add.bitmapText(this.game.world.centerX, 100, 'videogame', 'GAME OVER', 64);
	    this.gameOverText.anchor.setTo(0.5);
	    
	    this.finalScoreTitle = this.game.add.bitmapText(this.game.world.centerX, 200, 'videogame', 'Final Score', 20);
	    this.finalScoreTitle.anchor.setTo(0.5);
	    this.finalScoreText = this.game.add.bitmapText(this.game.world.centerX, 230, 'desyrel', finalScore, 45);
	    this.finalScoreText.anchor.setTo(0.5);

	    this.button = this.game.add.button(this.game.world.centerX, 400, 'exit', this.restartGame, this, 0, 2, 1);
	    this.button.anchor.setTo(0.5);
	},

	update: function() {
		this.finalScoreText.text = finalScore;
		this.background.tilePosition.y += this.backgroundv;
	},

	restartGame() {
		gameover = false;
	    this.game.state.start('menu');
	}

};