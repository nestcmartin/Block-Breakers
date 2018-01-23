'use strict';

var creditsY = 50;

var CreditsScene = {

	preload: function()	{
    	this.game.load.spritesheet('exit', 'assets/exit.png', 137, 37);
	},

	create: function () {

		// Fondo
		this.background = this.game.add.tileSprite(0, 0, GAME_W, GAME_H, 'background')
		this.backgroundv = 5;

		// Texto
		this.gameOverText = this.game.add.bitmapText(this.game.world.centerX, textFirstY, 'videogame', 'CREDITS', 64);
	    this.gameOverText.anchor.setTo(0.5);	 

	    // Créditos
	    this.text1 = this.game.add.bitmapText(this.game.world.centerX, creditsY * 4, 'videogame', 'DEVELOPED by GARZONERS:', 25);
	    this.text1.anchor.setTo(0.5);
	    this.text2 = this.game.add.bitmapText(this.game.world.centerX, creditsY * 5, 'videogame', 'Nestor Cabrero, Martin Amechazurra', 20);
	    this.text2.anchor.setTo(0.5);
	    this.text3 = this.game.add.bitmapText(this.game.world.centerX, creditsY * 6, 'videogame', 'MUSIC & SOUND:', 25);
	    this.text3.anchor.setTo(0.5);
	    this.text4 = this.game.add.bitmapText(this.game.world.centerX, creditsY * 7, 'videogame', '"Blue Space" by FoxSynergy', 20);
	    this.text4.anchor.setTo(0.5);
	    this.text5 = this.game.add.bitmapText(this.game.world.centerX, creditsY * 8, 'videogame', '"Korobeiniki" by Dave Wave', 20);
	    this.text5.anchor.setTo(0.5);
	    this.text5 = this.game.add.bitmapText(this.game.world.centerX, creditsY * 9, 'videogame', 'Little Robot Sound Factory - www.littlerobotsoundfactory.com', 15);
	    this.text5.anchor.setTo(0.5);
	    this.text5 = this.game.add.bitmapText(this.game.world.centerX, creditsY * 10, 'videogame', 'Zander Noriega', 20);
	    this.text5.anchor.setTo(0.5);
	    this.text5 = this.game.add.bitmapText(this.game.world.centerX, creditsY * 11, 'videogame', 'Block Breakers is a student project, tribute to Tetris. All rights reserved to The Tetris Company, LLC.', 10);
	    this.text5.anchor.setTo(0.5);

	    // Botón
	    this.button = this.game.add.button(this.game.world.centerX, GAME_H - offsetY, 'exit', this.restartGame, this, 0, 2, 1);
	    this.button.anchor.setTo(0.5);

	    // Música
	    this.creditsMusic = this.game.add.audio('creditsMusic');
	    this.creditsMusic.play();
	},

	update: function() {
		this.background.tilePosition.y += this.backgroundv;
	},

	restartGame() {
	    this.game.state.start('menu');
	    this.creditsMusic.stop();
	}
};