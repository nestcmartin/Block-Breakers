'use strict';

var blockSize = 32;
var nBlocksX = 12;
var nBlocksY = 20;
var finalScore = 0;
var level = 0;

var PIECES = 'ILJOTSZB';
var QUEUE_SIZE = 2;
var DROP_TIME = Phaser.Timer.SECOND;
var DROP_SPEEDUP = 90;
var SCORE_BONUS = 25;
var LINES_THRESHOLD = 10;

var MATRIX_SIZE = 4;
var BOMB_RADIUS = 3;

// Jugabilidad
var movementLag = 50;	// retardo entre pulsaciones de tecla (ms)
var movetimer = 0;		// contador para evitar movimientos excesivamente rapidos
var pause = false;		// variable de control para festionar la pausa del juego
var gameover = false;	// variable de control para gestionar el fin de partida
var cursors;			// el input de usuario (movimientos)
var rotates;			// el input de usuario (rotaciones)
var pauseButton;		// el input de usuario (pausa)
var pvpButton;
var escButton;
var audioManager;		// el gestor de sonidos

// UI
var scoreText;											// puntuacion
var linesText;											// texto Lines
var menuWidth = 10 * blockSize;							// tamaño del menu principal
var gameWidth = 2 * nBlocksX * blockSize + menuWidth;	// ancho de la pantalla de juego
var gameHeight = nBlocksY * blockSize + blockSize;		// alto de la pantalla de juego
var scoreX = nBlocksX * blockSize + 90;					// posicion del marcador de puntuacion


var GameScene = {

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
		this.tetris.selectLevel(level);
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

	    this.p2Text = this.game.add.bitmapText(nBlocksX * blockSize + menuWidth + 30, this.game.world.height / 2, 'videogame', 'PRESS ENTER', 30);

	    // Puntuación
	    this.scoreTitle = this.game.add.bitmapText(nBlocksX * blockSize + 50, 40, 'videogame', 'Score', 40);
	    scoreText = this.game.add.bitmapText(scoreX, 80, 'desyrel', '0', 64);

	    // Líneas
	    this.linesTitle = this.game.add.bitmapText(nBlocksX * blockSize + 50, 180, 'videogame', 'Lines', 40);
	    linesText = this.game.add.bitmapText(scoreX, 220, 'desyrel', '0', 64);

	    // Tetromino siguiente
	    this.grid = this.game.add.sprite((nBlocksX + 3) * blockSize, (1 + 2 * nBlocksY / 3) * blockSize, 'grid', 0);
	    this.nextTitle = this.game.add.bitmapText(nBlocksX * blockSize + 75, 380, 'videogame', 'Next', 40);

	    this.nextTitle.x = this.scoreTitle.x + this.scoreTitle.textWidth / 2 - (this.nextTitle.textWidth * 0.5);
	    this.linesTitle.x = this.scoreTitle.x + this.scoreTitle.textWidth / 2 - (this.linesTitle.textWidth * 0.5);

	    this.next = this.game.add.group();
	},

	alignText: function() {
	    var center = this.scoreTitle.x + this.scoreTitle.textWidth / 2;
	    scoreText.x = center - (scoreText.textWidth * 0.5);
	    linesText.x = center - (linesText.textWidth * 0.5);
	},

	nextTetromino() {

		// Creamos la pieza correspondiente
        var matrix = createPiece(PIECES[this.tetris.player.queue[0]]);
		var s_x = nBlocksX + 3;
	    var s_y = 1 + 2 * nBlocksY / 3;

	    // Limpiamos el grupo
        this.next.forEachAlive(function(sprite) { sprite.kill(); });

        // Asignamos los sprites
    	matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    var sprite = this.next.create((s_x + x) * blockSize, 
                        (s_y + y) * blockSize, 'blocks', value - 1);
                }
            });
        });
	},

	update: function() {

		this.alignText();
		this.background.tilePosition.y += this.backgroundv;
		this.background2.tilePosition.y += this.backgroundv;
		
		if (!pause) 
		{
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
		        else if (cursors.down.isDown)
		        {
		            this.tetris.player.fastDrop(1);
		        }

		        movetimer = 0;
		    }
		}

	    this.nextTetromino();

	    if(gameover) this.manageGameOver();
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
	    audioManager.music.stop();
	    audioManager.playSound(audioManager.gameOverSound);

	    audioManager.gameOverSound.onStop.add(this.gameOver, this);
	},

	gameOver: function() {
		this.game.state.start('gameover');
	}
};