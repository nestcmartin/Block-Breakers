'use strict';

// DIMENSIONES
var BLOCK_SIZE = 32;
var BLOCKS_X = 12;
var BLOCKS_Y = 20;
var MENU_W = 10 * BLOCK_SIZE;						// tamaño de la UI
var GAME_W = 2 * BLOCKS_X * BLOCK_SIZE + MENU_W;	// ancho de la pantalla de juego
var GAME_H = BLOCKS_Y * BLOCK_SIZE + BLOCK_SIZE;	// alto de la pantalla de juego
var UI_X = BLOCKS_X * BLOCK_SIZE + offsetX;			// posición de los textos de la UI

// VARIABLES
var LEVEL = 0;			// nivel seleccionado
var FINAL_SCORE = 0;	// puntuación final para mostrar en Game Over
var pause = false;		// variable de control para gestionar la pausa del juego
var gameover = false;	// variable de control para gestionar el fin de partida

// INPUT
var INPUT_LAG = 50;	// retardo entre pulsaciones de tecla (ms)
var cursors;		// el input de usuario (movimientos)
var cursors2;		// el input de usuario (movimientos 2)
var rotates;		// el input de usuario (rotaciones)
var pauseButton;	// el input de usuario (menú de pausa)
var pvpButton;		// el input de usuario (modo 2 jugadores)
var escButton;		// el input de usuario (volver al menú)

var GameScene = {

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

		this.createUI();

		this.tetris.selectLevel(LEVEL);
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
		cursors = this.game.input.keyboard.createCursorKeys();

		// Rotaciones
		rotates = {
			counterClockwise: this.game.input.keyboard.addKey(Phaser.Keyboard.Q),			
			clockwise: this.game.input.keyboard.addKey(Phaser.Keyboard.W)
		};
		rotates.clockwise.onDown.add(function() { this.manageRotation(true) }, this);
		rotates.counterClockwise.onDown.add(function() { this.manageRotation(false) }, this);

		// Pausa
		pauseButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		pauseButton.onDown.add(this.managePauseScreen, this);

		// 2P
		pvpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		pvpButton.onDown.add(this.managePVP, this);

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
		// Mensaje PvP
		this.p2Text = this.game.add.bitmapText(BLOCKS_X * BLOCK_SIZE + MENU_W + uiOffsetX / 2, this.game.world.height / 2, 'videogame', 'PRESS ENTER', 30);

		// Icono de sonido
	    this.sound = this.game.add.sprite(this.game.world.width / 2 + 4 * offsetX / 3, 0, 'sound', 0);
	    this.sound.inputEnabled = true;
	    this.sound.events.onInputDown.add(audioManager.toggleSound, audioManager);

	    // Puntuación y líneas
	    this.scoreTitle = this.game.add.bitmapText(BLOCKS_X * BLOCK_SIZE + uiOffsetX, uiOffsetY, 'videogame', 'Score', 40);
	    this.tetris.scoreText = this.game.add.bitmapText(UI_X, 2 * uiOffsetY, 'desyrel', '0', 64);
	    this.linesTitle = this.game.add.bitmapText(BLOCKS_X * BLOCK_SIZE + uiOffsetX, 4 * uiOffsetY, 'videogame', 'Lines', 40);
	    this.tetris.linesText = this.game.add.bitmapText(UI_X, 5 * uiOffsetY, 'desyrel', '0', 64);

	    // Tetromino siguiente
	    this.nextTitle = this.game.add.bitmapText(BLOCKS_X * BLOCK_SIZE + 2 * uiOffsetX / 3, 9 * uiOffsetY, 'videogame', 'Next', 40);
	    this.grid = this.game.add.sprite((BLOCKS_X + 3) * BLOCK_SIZE, (1 + 2 * BLOCKS_Y / 3) * BLOCK_SIZE, 'grid', 0);
	    

	    this.nextTitle.x = this.scoreTitle.x + this.scoreTitle.textWidth / 2 - (this.nextTitle.textWidth * 0.5);
	    this.linesTitle.x = this.scoreTitle.x + this.scoreTitle.textWidth / 2 - (this.linesTitle.textWidth * 0.5);

	    this.next = this.game.add.group();
	},

	alignText: function() {
	    var center = this.scoreTitle.x + this.scoreTitle.textWidth / 2;
	    this.tetris.scoreText.x = center - (this.tetris.scoreText.textWidth * 0.5);
	    this.tetris.linesText.x = center - (this.tetris.linesText.textWidth * 0.5);
	},

	nextTetromino() {

		// Creamos la pieza correspondiente
        var matrix = createPiece(PIECES[this.tetris.player.queue[0]]);
		var s_x = BLOCKS_X + 3;
	    var s_y = 1 + 2 * BLOCKS_Y / 3;

	    // Limpiamos el grupo
        this.next.forEachAlive(function(sprite) { sprite.kill(); });

        // Asignamos los sprites
    	matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    var sprite = this.next.create((s_x + x) * BLOCK_SIZE, 
                        (s_y + y) * BLOCK_SIZE, 'blocks', value - 1);
                }
            });
        });
	},

	update: function() {

		this.alignText();
		this.background.tilePosition.y += this.backgroundv;
		this.background2.tilePosition.y += this.backgroundv;

		this.handleInput();

	    this.nextTetromino();

	    if(gameover) this.manageGameOver();
	},

	handleInput() {

		if (!pause) 
		{
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
		        else if (cursors.down.isDown)
		        {
		            this.tetris.player.fastDrop(1);
		        }

		        this.tetris.moveTimer = 0;
		    }
		}
	},

	manageRotation: function(clockwise) {

		if (clockwise) this.tetris.player.rotate(-1);
		else this.tetris.player.rotate(1);
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

	managePVP: function() {
		this.tetris.timer.stop();
	    audioManager.music.stop();
	    this.game.state.start('game2');
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
		FINAL_SCORE = this.tetris.score;

	    audioManager.music.stop();
	    audioManager.playSound(audioManager.gameOverSound);	    
	    audioManager.gameOverSound.onStop.add(this.gameOver, this);
	},

	gameOver: function() {
		this.game.state.start('gameover');
	}
};