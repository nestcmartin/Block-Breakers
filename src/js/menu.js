'use strict';

var MenuScene = {

	create: function () {
		this.background = this.game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background')
		this.backgroundv = 5;

		this.blockText = this.game.add.bitmapText(this.game.world.centerX, 100, 'videogame', 'BLOCK', 64);
	    this.blockText.anchor.setTo(0.5);
	    this.breakersText = this.game.add.bitmapText(this.game.world.centerX, 200, 'videogame', 'BREAKERS', 64);
	    this.breakersText.anchor.setTo(0.5);

	    this.button = this.game.add.button(this.game.world.centerX, 400, 'button', this.onePlayer, this, 0, 2, 1);
	    this.button.anchor.setTo(0.5);

	    this.button2 = this.game.add.button(this.game.world.centerX, 450, 'button2', this.startGame, this, 0, 2, 1);
	    this.button2.anchor.setTo(0.5);

	    this.menuMusic = this.game.add.audio('menuMusic');
	    this.menuMusic.play();

	    console.log("Menu State success!");
	},

	update: function() {
		this.background.tilePosition.y += this.backgroundv;
	},

	startGame() {
	    this.game.state.start('game');
	    this.menuMusic.stop();
	},

	onePlayer: function() {
		this.button.kill();
		this.button2.kill();

		this.onePlayerText = this.game.add.bitmapText(this.game.world.centerX, 300, 'videogame', 'One Player', 40);
	    this.onePlayerText.anchor.setTo(0.5);

	    this.selectLevelText = this.game.add.bitmapText(this.game.world.centerX, 340, 'videogame', 'Select Level:', 25);
	    this.selectLevelText.anchor.setTo(0.5);

	    var l = 0;
	    for (let i = 400; i < gameHeight; i += 60)
	    {
	    	var button = this.game.add.button(this.game.world.centerX - 90, i, 'button', function() { this.startGameAtLevel(l) }, this, 0, 2, 1);
	    	button.anchor.setTo(0.5);
	    	l++;
	    }

	    for (let i = 400; i < gameHeight; i += 60)
	    {
	    	var button = this.game.add.button(this.game.world.centerX + 90, i, 'button', function() { this.startGameAtLevel(l) }, this, 0, 2, 1);
	    	button.anchor.setTo(0.5);
	    	l++;
	    }
	},

	startGameAtLevel: function(lv) {
		level = lv;
		this.startGame();
	}
};