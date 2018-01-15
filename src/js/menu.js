'use strict';

var blockTextY = 100;
var breakersTextY = 200;
var onePlayerTextY = 300;
var selectLevelTextY = 340;

var buttonY = 400;
var buttonOffsetX = 90;
var buttonOffsetY = 60;

var MenuScene = {

	preload: function() {
		this.game.load.image('background', 'assets/starfield.png');
	},

	create: function () {

		// Creamos el fondo
		this.background = this.game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background')
		this.backgroundv = 5;

		// Creamos el texto
		this.blockText = this.game.add.bitmapText(this.game.world.centerX, blockTextY, 'videogame', 'BLOCK', 64);
	    this.blockText.anchor.setTo(0.5);
	    this.breakersText = this.game.add.bitmapText(this.game.world.centerX, breakersTextY, 'videogame', 'BREAKERS', 64);
	    this.breakersText.anchor.setTo(0.5);

	    // Creamos los botones
	    this.button = this.game.add.button(this.game.world.centerX, buttonY, 'button', this.onePlayer, this, 0, 2, 1);
	    this.button.anchor.setTo(0.5);
	    this.button2 = this.game.add.button(this.game.world.centerX, buttonY + buttonOffsetY, 'button2', this.startGame2, this, 0, 2, 1);
	    this.button2.anchor.setTo(0.5);

	    // Creamos la música
	    this.menuMusic = this.game.add.audio('menuMusic');
	    this.menuMusic.play();
	},

	update: function() {
		this.background.tilePosition.y += this.backgroundv;
	},

	startGame(lv) {
		level = lv;
	    this.game.state.start('game');
	    this.menuMusic.stop();
	},

	startGame2() {
		level = 0;
	    this.game.state.start('game2');
	    this.menuMusic.stop();
	},

	onePlayer: function() {

		// Eliminamos los botones anteriores
		this.button.kill();
		this.button2.kill();

		// Mostramos el texto de selección de nivel
		this.onePlayerText = this.game.add.bitmapText(this.game.world.centerX, onePlayerTextY, 'videogame', 'One Player', 40);
	    this.onePlayerText.anchor.setTo(0.5);
	    this.selectLevelText = this.game.add.bitmapText(this.game.world.centerX, selectLevelTextY, 'videogame', 'Select Level:', 25);
	    this.selectLevelText.anchor.setTo(0.5);

	    // Creamos los botones para cada nivel
	    this.buttonLV0 = this.game.add.button(this.game.world.centerX - buttonOffsetX, buttonY, 'level00', function() { this.startGame(0) }, this, 0, 2, 1);
    	this.buttonLV0.anchor.setTo(0.5);
    	this.buttonLV1 = this.game.add.button(this.game.world.centerX - buttonOffsetX, buttonY + buttonOffsetY, 'level01', function() { this.startGame(1) }, this, 0, 2, 1);
    	this.buttonLV1.anchor.setTo(0.5);
    	this.buttonLV2 = this.game.add.button(this.game.world.centerX - buttonOffsetX, buttonY + buttonOffsetY * 2, 'level02', function() { this.startGame(2) }, this, 0, 2, 1);
    	this.buttonLV2.anchor.setTo(0.5);
    	this.buttonLV3 = this.game.add.button(this.game.world.centerX - buttonOffsetX, buttonY + buttonOffsetY * 3, 'level03', function() { this.startGame(3) }, this, 0, 2, 1);
    	this.buttonLV3.anchor.setTo(0.5);
    	this.buttonLV4 = this.game.add.button(this.game.world.centerX - buttonOffsetX, buttonY + buttonOffsetY * 4, 'level04', function() { this.startGame(4) }, this, 0, 2, 1);
    	this.buttonLV4.anchor.setTo(0.5);
    	this.buttonLV5 = this.game.add.button(this.game.world.centerX + buttonOffsetX, buttonY, 'level05', function() { this.startGame(5) }, this, 0, 2, 1);
    	this.buttonLV5.anchor.setTo(0.5);
    	this.buttonLV6 = this.game.add.button(this.game.world.centerX + buttonOffsetX, buttonY + buttonOffsetY, 'level06', function() { this.startGame(6) }, this, 0, 2, 1);
    	this.buttonLV6.anchor.setTo(0.5);
    	this.buttonLV7 = this.game.add.button(this.game.world.centerX + buttonOffsetX, buttonY + buttonOffsetY * 2, 'level07', function() { this.startGame(7) }, this, 0, 2, 1);
    	this.buttonLV7.anchor.setTo(0.5);
    	this.buttonLV8 = this.game.add.button(this.game.world.centerX + buttonOffsetX, buttonY + buttonOffsetY * 3, 'level08', function() { this.startGame(8) }, this, 0, 2, 1);
    	this.buttonLV8.anchor.setTo(0.5);
    	this.buttonLV9 = this.game.add.button(this.game.world.centerX + buttonOffsetX, buttonY + buttonOffsetY * 4, 'level09', function() { this.startGame(9) }, this, 0, 2, 1);
    	this.buttonLV9.anchor.setTo(0.5);
	}
};