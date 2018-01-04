'use strict';

var MenuScene = {

	create: function () {
		this.background = this.game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background')
		this.backgroundv = 5;

		this.blockText = this.game.add.bitmapText(this.game.world.centerX, 100, 'videogame', 'BLOCK', 64);
	    this.blockText.anchor.setTo(0.5);
	    this.breakersText = this.game.add.bitmapText(this.game.world.centerX, 200, 'videogame', 'BREAKERS', 64);
	    this.breakersText.anchor.setTo(0.5);

	    this.button = this.game.add.button(this.game.world.centerX, 400, 'button', this.startGame, this, 0, 2, 1);
	    this.button.anchor.setTo(0.5);

	    console.log("Menu State success!");
	},

	update: function() {
		this.background.tilePosition.y += this.backgroundv;
	},

	startGame() {
	    this.game.state.start('game');
	}
};