'use strict';

var uiOffsetX = 50;
var uiOffsetY = 40;
var offsetX = 90;
var offsetY = 60;
var textFirstY = 100;
var textSecondY = 2 * textFirstY;
var textThirdY = 3 * textFirstY;
var menuButtonY = 4 * textFirstY;
var finalScoreTextY = textThirdY - offsetY;
var selectLevelTextY = menuButtonY - offsetY;

var MenuScene = {

	preload: function() {
		this.game.load.image('background', 'assets/starfield.png');
		this.game.load.image('base', 'assets/base.png');
	},

	create: function () {

		// Creamos el fondo
		this.background = this.game.add.tileSprite(0, 0, GAME_W, GAME_H, 'background')
		this.backgroundv = 5;
		this.base = this.game.add.sprite(-390, 50, 'base', 0)

		// Creamos el texto
		this.blockText = this.game.add.bitmapText(this.game.world.centerX, textFirstY, 'videogame', 'BLOCK', 64);
	    this.blockText.anchor.setTo(0.5);
	    this.breakersText = this.game.add.bitmapText(this.game.world.centerX, textSecondY, 'videogame', 'BREAKERS', 64);
	    this.breakersText.anchor.setTo(0.5);

	    // Creamos los botones
	    this.button = this.game.add.button(this.game.world.centerX, menuButtonY, 'button', this.onePlayer, this, 0, 2, 1);
	    this.button.anchor.setTo(0.5);
	    this.button2 = this.game.add.button(this.game.world.centerX, menuButtonY + offsetY, 'button2', this.startGame2, this, 0, 2, 1);
	    this.button2.anchor.setTo(0.5);
	    this.button3 = this.game.add.button(this.game.world.centerX, menuButtonY + 2 * offsetY, 'button3', this.goToCredits, this, 0, 2, 1);
	    this.button3.anchor.setTo(0.5);

	    // Creamos la música
	    this.menuMusic = this.game.add.audio('menuMusic');
	    this.menuMusic.play();
	},

	update: function() {
		this.background.tilePosition.y += this.backgroundv;
	},

	startGame(lv) {
		LEVEL = lv;
	    this.game.state.start('game');
	    this.menuMusic.stop();
	},

	startGame2() {
		LEVEL = 0;
	    this.game.state.start('game2');
	    this.menuMusic.stop();
	},

	onePlayer: function() {

		// Eliminamos los botones anteriores
		this.button.kill();
		this.button2.kill();
		this.button3.kill();
		this.makeShade();

		// Mostramos el texto de selección de nivel
		this.onePlayerText = this.game.add.bitmapText(this.game.world.centerX, textThirdY, 'videogame', 'One Player', 40);
	    this.onePlayerText.anchor.setTo(0.5);
	    this.selectLevelText = this.game.add.bitmapText(this.game.world.centerX, selectLevelTextY, 'videogame', 'Select Level:', 25);
	    this.selectLevelText.anchor.setTo(0.5);

	    // Creamos los botones para cada nivel
	    this.buttonLV0 = this.game.add.button(this.game.world.centerX - offsetX, menuButtonY, 'level00', function() { this.startGame(0) }, this, 0, 2, 1);
    	this.buttonLV0.anchor.setTo(0.5);
    	this.buttonLV1 = this.game.add.button(this.game.world.centerX - offsetX, menuButtonY + offsetY, 'level01', function() { this.startGame(1) }, this, 0, 2, 1);
    	this.buttonLV1.anchor.setTo(0.5);
    	this.buttonLV2 = this.game.add.button(this.game.world.centerX - offsetX, menuButtonY + offsetY * 2, 'level02', function() { this.startGame(2) }, this, 0, 2, 1);
    	this.buttonLV2.anchor.setTo(0.5);
    	this.buttonLV3 = this.game.add.button(this.game.world.centerX - offsetX, menuButtonY + offsetY * 3, 'level03', function() { this.startGame(3) }, this, 0, 2, 1);
    	this.buttonLV3.anchor.setTo(0.5);
    	this.buttonLV4 = this.game.add.button(this.game.world.centerX - offsetX, menuButtonY + offsetY * 4, 'level04', function() { this.startGame(4) }, this, 0, 2, 1);
    	this.buttonLV4.anchor.setTo(0.5);
    	this.buttonLV5 = this.game.add.button(this.game.world.centerX + offsetX, menuButtonY, 'level05', function() { this.startGame(5) }, this, 0, 2, 1);
    	this.buttonLV5.anchor.setTo(0.5);
    	this.buttonLV6 = this.game.add.button(this.game.world.centerX + offsetX, menuButtonY + offsetY, 'level06', function() { this.startGame(6) }, this, 0, 2, 1);
    	this.buttonLV6.anchor.setTo(0.5);
    	this.buttonLV7 = this.game.add.button(this.game.world.centerX + offsetX, menuButtonY + offsetY * 2, 'level07', function() { this.startGame(7) }, this, 0, 2, 1);
    	this.buttonLV7.anchor.setTo(0.5);
    	this.buttonLV8 = this.game.add.button(this.game.world.centerX + offsetX, menuButtonY + offsetY * 3, 'level08', function() { this.startGame(8) }, this, 0, 2, 1);
    	this.buttonLV8.anchor.setTo(0.5);
    	this.buttonLV9 = this.game.add.button(this.game.world.centerX + offsetX, menuButtonY + offsetY * 4, 'level09', function() { this.startGame(9) }, this, 0, 2, 1);
    	this.buttonLV9.anchor.setTo(0.5);
	},

	goToCredits: function() {
		this.game.state.start('credits');
	    this.menuMusic.stop();
	},

	makeShade: function() {
	    this.shade = this.game.add.graphics(0, 0);
	    this.shade.beginFill(0x000000, 0.6);
	    this.shade.drawRect(0, 0, this.game.world.width, this.game.world.height);
	    this.shade.endFill();
	}
};