'use strict';

var scoreText2;
var movetimer2 = 0;
var gameover2 = false;
var cursors2;
var linesText2;

var Game2Scene = {
	preload: function() {
		this.game.load.image('grid', 'assets/grid.png');
		this.game.load.image('ground', 'assets/ground.png');		
		this.game.load.image('bricks', 'assets/bricks.png');
		this.game.load.spritesheet('boom', 'assets/explode.png', 128, 128);
		this.game.load.spritesheet('blocks','assets/blocks.png', blockSize, blockSize, 8);
    	this.game.load.spritesheet('sound','assets/sound.png', 32, 32);
    	this.game.load.audio('move','assets/sound/move.mp3','assets/sound/move.ogg');    	
    	this.game.load.audio('click','assets/sound/click.mp3','assets/sound/click.ogg');	
    	this.game.load.audio('level','assets/sound/level.mp3','assets/sound/level.ogg');
    	this.game.load.audio('win','assets/sound/win.mp3','assets/sound/win.ogg');
    	this.game.load.audio('boom','assets/sound/boom.mp3','assets/sound/boom.ogg');
    	this.game.load.audio('gameover','assets/sound/gameover.mp3','assets/sound/gameover.ogg');
	},

	create: function() {

	    this.createAudio();
		this.createInput();
		this.createArena();
		this.createUI();

		this.tetris = new Tetris(0, 0, this.game);
		this.tetris2 = new Tetris(22, 0, this.game);
	},

	createAudio: function() {
		// Inicializacion del sistema de audio
	    audioManager = new AudioManager();
	    audioManager.moveSound = this.game.add.audio('move');	    
	    audioManager.clickSound = this.game.add.audio('click');
	    audioManager.levelSound = this.game.add.audio('level');
	    audioManager.winSound = this.game.add.audio('win');
	    audioManager.boomSound = this.game.add.audio('boom');
	    audioManager.gameOverSound = this.game.add.audio('gameover');
	    audioManager.music = this.game.add.audio('music');
	    audioManager.music.volume = 0.8;
	    audioManager.music.loopFull();
	},

	createInput: function() {

		// Movimientos
		cursors = {
			left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),			
			drop: this.game.input.keyboard.addKey(Phaser.Keyboard.S),		
			right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),			
		};

		cursors2 = this.game.input.keyboard.createCursorKeys();

		// Rotaciones
		rotates = {
			counterClockwise: this.game.input.keyboard.addKey(Phaser.Keyboard.Q),			
			clockwise: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
			counterClockwise2: this.game.input.keyboard.addKey(Phaser.Keyboard.U),			
			clockwise2: this.game.input.keyboard.addKey(Phaser.Keyboard.I)
		};
		rotates.clockwise.onDown.add(function() { this.manageRotation(true, this.tetris) }, this);
		rotates.counterClockwise.onDown.add(function() { this.manageRotation(false, this.tetris) }, this);
		rotates.clockwise2.onDown.add(function() { this.manageRotation(true, this.tetris2) }, this);
		rotates.counterClockwise2.onDown.add(function() { this.manageRotation(false, this.tetris2) }, this);

		// Pausa
		pauseButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		pauseButton.onDown.add(this.managePauseScreen, this);

		// Volver al Menú
		escButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		escButton.onDown.add(this.backToMenu, this);
	},

	createArena: function() {

		// Fondo del tablero
		this.background = this.game.add.tileSprite(0, 0, nBlocksX * blockSize, nBlocksY * blockSize, 'background')
		this.background2 = this.game.add.tileSprite(nBlocksX * blockSize + menuWidth, 0, nBlocksX * blockSize, nBlocksY * blockSize, 'background')
		this.backgroundv = 5;		

		// Separadores
		this.bricks = this.game.add.tileSprite(nBlocksX * blockSize, 0, menuWidth, gameHeight, 'bricks', 0);
	    this.middleSeparator = this.game.add.graphics(nBlocksX * blockSize, 0);
	    this.middleSeparator.lineStyle(3, 0xffffff, 1);
	    this.middleSeparator.lineTo(0, this.game.world.height);
	    this.middleSeparator2 = this.game.add.graphics(nBlocksX * blockSize + menuWidth, 0);
	    this.middleSeparator2.lineStyle(3, 0xffffff, 1);
	    this.middleSeparator2.lineTo(0, this.game.world.height);

	    // Suelo del tablero
	    this.game.add.tileSprite(0, this.game.world.height - blockSize, nBlocksX * blockSize, blockSize,'ground', 0);
	    this.game.add.tileSprite(nBlocksX * blockSize + menuWidth, this.game.world.height - blockSize, nBlocksX * blockSize, blockSize,'ground', 0);
	},

	createUI: function() {
		// Icono de sonido
	    this.sound = this.game.add.sprite(this.game.world.width - 38, 0, 'sound', 0);
	    this.sound.inputEnabled = true;
	    this.sound.events.onInputDown.add(audioManager.toggleSound, this);

	    // Puntuación y Líneas
	    this.scoreTitle = this.game.add.bitmapText(nBlocksX * blockSize + 50, 40, 'videogame', 'Score', 40);
	    scoreText = this.game.add.bitmapText(scoreX, 80, 'desyrel', '0', 64);
	    this.linesTitle = this.game.add.bitmapText(nBlocksX * blockSize + 50, 180, 'videogame', 'Lines', 40);
	    linesText = this.game.add.bitmapText(scoreX, 220, 'desyrel', '0', 64);

	    this.scoreTitle2 = this.game.add.bitmapText(nBlocksX * blockSize + 50, 320, 'videogame', 'Score', 40);
	    scoreText2 = this.game.add.bitmapText(scoreX, 360, 'desyrel', '0', 64);
	    this.linesTitle2 = this.game.add.bitmapText(nBlocksX * blockSize + 50, 460, 'videogame', 'Lines', 40);
	    linesText2 = this.game.add.bitmapText(scoreX, 500, 'desyrel', '0', 64);

	    this.scoreTitle2.x = this.scoreTitle.x + this.scoreTitle.textWidth / 2 - (this.scoreTitle2.textWidth * 0.5);
	    this.linesTitle.x = this.scoreTitle.x + this.scoreTitle.textWidth / 2 - (this.linesTitle.textWidth * 0.5);
	    this.linesTitle2.x = this.scoreTitle2.x + this.scoreTitle2.textWidth / 2 - (this.linesTitle2.textWidth * 0.5);
	},

	update: function() {

		this.alignText();

		this.background.tilePosition.y += this.backgroundv;
		this.background2.tilePosition.y += this.backgroundv;

	    if (!pause) this.handleInput();

	    if (gameover || gameover2) this.manageGameOver();
	},

	alignText: function() {
	    var center = this.scoreTitle.x + this.scoreTitle.textWidth / 2;
	    scoreText.x = center - (scoreText.textWidth * 0.5);
	    scoreText2.x = center - (scoreText2.textWidth * 0.5);
	    linesText.x = center - (linesText.textWidth * 0.5);
	    linesText2.x = center - (linesText2.textWidth * 0.5);
	},

	handleInput() {

		movetimer += this.time.elapsed;

	    if (movetimer > movementLag) 
	    {	        
	        if (cursors.left.isDown)
	        {
	            this.tetris.player.move(-1);         
	        }
	        else if (cursors.right.isDown)
	        {
	            this.tetris.player.move(1);  
	        }
	        else if (cursors.drop.isDown)
	        {
	            this.tetris.player.fastDrop(1);
	        }

	        movetimer = 0;
	    }

	    movetimer2 += this.time.elapsed;

	    if (movetimer2 > movementLag) 
	    {	        
	        if (cursors2.left.isDown)
	        {
	            this.tetris2.player.move(-1);          
	        }
	        else if (cursors2.right.isDown)
	        {
	            this.tetris2.player.move(1);  
	        }
	        else if (cursors2.down.isDown)
	        {
	            this.tetris2.player.fastDrop(1);
	        }

	        movetimer2 = 0;
	    }
	},

	manageRotation: function(clockwise, tetris) {

		if (clockwise) tetris.player.rotate(-1);
		else tetris.player.rotate(1);
	},

	managePauseScreen: function() {

		if(!gameover)
		{
			pause = !pause;
			this.tetris.timer.pause();
	    
		    if(pause)
		    {
		        audioManager.music.pause();
		        this.makeShade();
		        this.pauseText = this.game.add.bitmapText(this.game.world.centerX, this.game.world.centerY, 'videogame', 'PAUSE', 64);
		        this.pauseText.anchor.setTo(0.5);

		    }
		    else
		    {
		        this.shade.clear();
		        this.pauseText.destroy();
		        this.tetris.timer.resume();
		        audioManager.playMusic();
		    }
		}	    
	},

	backToMenu: function() {
		this.tetris.timer.stop();
	    audioManager.music.stop();
	    this.game.state.start('menu');
	},

	makeShade: function() {
	    this.shade = this.game.add.graphics(0, 0);
	    this.shade.beginFill(0x000000, 0.6);
	    this.shade.drawRect(0, 0, this.game.world.width, this.game.world.height);
	    this.shade.endFill();
	},

	manageGameOver: function() {

		this.tetris.timer.stop();
	    audioManager.music.stop();
	    audioManager.playSound(audioManager.gameOverSound);

	    audioManager.gameOverSound.onStop.add(this.gameOver, this);
	},

	gameOver: function() {
		this.game.state.start('gameover');
	}
};