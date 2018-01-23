'use strict';

var cursors2;

var Game2Scene = {

	preload: function() {
		this.game.load.image('grid', 'assets/grid.png');
		this.game.load.image('ground', 'assets/ground.png');		
		this.game.load.image('bricks', 'assets/bricks.png');
		this.game.load.spritesheet('boom', 'assets/explode.png', 128, 128);
		this.game.load.spritesheet('blocks','assets/blocks.png', BLOCK_SIZE, BLOCK_SIZE, 8);
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

		this.tetris = new Tetris(0, 0, this.game);
		this.tetris2 = new Tetris(22, 0, this.game);

		this.createUI();
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
		this.background = this.game.add.tileSprite(0, 0, BLOCKS_X * BLOCK_SIZE, BLOCKS_Y * BLOCK_SIZE, 'background')
		this.background2 = this.game.add.tileSprite(BLOCKS_X * BLOCK_SIZE + MENU_W, 0, BLOCKS_X * BLOCK_SIZE, BLOCKS_Y * BLOCK_SIZE, 'background')
		this.backgroundv = 5;		

		// Separadores
		this.bricks = this.game.add.tileSprite(BLOCKS_X * BLOCK_SIZE, 0, MENU_W, GAME_H, 'bricks', 0);
	    this.middleSeparator = this.game.add.graphics(BLOCKS_X * BLOCK_SIZE, 0);
	    this.middleSeparator.lineStyle(3, 0xffffff, 1);
	    this.middleSeparator.lineTo(0, this.game.world.height);
	    this.middleSeparator2 = this.game.add.graphics(BLOCKS_X * BLOCK_SIZE + MENU_W, 0);
	    this.middleSeparator2.lineStyle(3, 0xffffff, 1);
	    this.middleSeparator2.lineTo(0, this.game.world.height);

	    // Suelo del tablero
	    this.game.add.tileSprite(0, this.game.world.height - BLOCK_SIZE, BLOCKS_X * BLOCK_SIZE, BLOCK_SIZE,'ground', 0);
	    this.game.add.tileSprite(BLOCKS_X * BLOCK_SIZE + MENU_W, this.game.world.height - BLOCK_SIZE, BLOCKS_X * BLOCK_SIZE, BLOCK_SIZE,'ground', 0);
	},

	createUI: function() {
		// Icono de sonido
	    this.sound = this.game.add.sprite(this.game.world.width / 2 + 4 * offsetX / 3, 0, 'sound', 0);
	    this.sound.inputEnabled = true;
	    this.sound.events.onInputDown.add(audioManager.toggleSound, this);

	    // Puntuación y Líneas
	    this.scoreTitle = this.game.add.bitmapText(BLOCKS_X * BLOCK_SIZE + uiOffsetX, uiOffsetY, 'videogame', 'Score', 40);
	    this.tetris.scoreText = this.game.add.bitmapText(UI_X, 2 * uiOffsetY, 'desyrel', '0', 64);
	    this.linesTitle = this.game.add.bitmapText(BLOCKS_X * BLOCK_SIZE + uiOffsetX, 4 * uiOffsetY, 'videogame', 'Lines', 40);
	    this.tetris.linesText = this.game.add.bitmapText(UI_X, 5 * uiOffsetY, 'desyrel', '0', 64);
	    this.scoreTitle2 = this.game.add.bitmapText(BLOCKS_X * BLOCK_SIZE + uiOffsetX, 7 * uiOffsetY, 'videogame', 'Score', 40);
	    this.tetris2.scoreText = this.game.add.bitmapText(UI_X, 8 * uiOffsetY, 'desyrel', '0', 64);
	    this.linesTitle2 = this.game.add.bitmapText(BLOCKS_X * BLOCK_SIZE + uiOffsetX, 10 * uiOffsetY, 'videogame', 'Lines', 40);
	    this.tetris2.linesText = this.game.add.bitmapText(UI_X, 11 * uiOffsetY, 'desyrel', '0', 64);

	    this.scoreTitle2.x = this.scoreTitle.x + this.scoreTitle.textWidth / 2 - (this.scoreTitle2.textWidth * 0.5);
	    this.linesTitle.x = this.scoreTitle.x + this.scoreTitle.textWidth / 2 - (this.linesTitle.textWidth * 0.5);
	    this.linesTitle2.x = this.scoreTitle2.x + this.scoreTitle2.textWidth / 2 - (this.linesTitle2.textWidth * 0.5);
	},

	alignText: function() {
	    var center = this.scoreTitle.x + this.scoreTitle.textWidth / 2;
	    this.tetris.scoreText.x = center - (this.tetris.scoreText.textWidth * 0.5);
	    this.tetris2.scoreText.x = center - (this.tetris2.scoreText.textWidth * 0.5);
	    this.tetris.linesText.x = center - (this.tetris.linesText.textWidth * 0.5);
	    this.tetris2.linesText.x = center - (this.tetris2.linesText.textWidth * 0.5);
	},

	update: function() {

		this.alignText();

		this.background.tilePosition.y += this.backgroundv;
		this.background2.tilePosition.y += this.backgroundv;

	    if (!pause) this.handleInput();

	    if (gameover) this.manageGameOver();
	},

	handleInput() {

		this.tetris.moveTimer += this.time.elapsed;

	    if (this.tetris.moveTimer > INPUT_LAG) 
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

	        this.tetris.moveTimer = 0;
	    }

	    this.tetris2.moveTimer += this.time.elapsed;

	    if (this.tetris2.moveTimer > INPUT_LAG) 
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

	        this.tetris2.moveTimer = 0;
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

		if (this.tetris.score >= this.tetris2.score) FINAL_SCORE = this.tetris.score;
		else FINAL_SCORE = this.tetris2.score;

	    audioManager.music.stop();
	    audioManager.playSound(audioManager.gameOverSound);
	    audioManager.gameOverSound.onStop.add(this.gameOver, this);
	},

	gameOver: function() {
		this.game.state.start('gameover');
	}
};