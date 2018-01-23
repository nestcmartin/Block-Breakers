'use strict';

var GameoverScene = {

	preload: function()	{
    	this.game.load.spritesheet('exit', 'assets/exit.png', 137, 37);
	},

	create: function () {

		// Fondo
		this.background = this.game.add.tileSprite(0, 0, GAME_W, GAME_H, 'background')
		this.backgroundv = 5;

		// Texto
		this.gameOverText = this.game.add.bitmapText(this.game.world.centerX, textFirstY, 'videogame', 'GAME OVER', 64);
	    this.gameOverText.anchor.setTo(0.5);	    
	    this.finalScoreTitle = this.game.add.bitmapText(this.game.world.centerX, textSecondY, 'videogame', 'Final Score', 20);
	    this.finalScoreTitle.anchor.setTo(0.5);
	    this.finalScoreText = this.game.add.bitmapText(this.game.world.centerX, finalScoreTextY, 'desyrel', FINAL_SCORE, 45);
	    this.finalScoreText.anchor.setTo(0.5);

	    // Botón
	    this.button = this.game.add.button(this.game.world.centerX, menuButtonY, 'exit', this.restartGame, this, 0, 2, 1);
	    this.button.anchor.setTo(0.5);
	},

	update: function() {
		this.finalScoreText.text = FINAL_SCORE;
		this.background.tilePosition.y += this.backgroundv;
	},

	restartGame() {
		gameover = false;
	    this.game.state.start('menu');
	}
};