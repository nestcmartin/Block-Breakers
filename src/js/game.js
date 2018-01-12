'use strict';

// Dimensiones
var nBlocks = 4;									// numero de bloques por tetromino
var nTypes = 7;										// numero de tipos de tetromino
var blockSize = 32;									// tamaño de los bloques en pixels
var nBlocksX = 12;									// numero de bloques de ancho
var nBlocksY = 20;									// numero de bloques de alto
var menuWidth = 300;								// tamaño del menu principal
var gameWidth = nBlocksX * blockSize + menuWidth;	// ancho de la pantalla de juego
var gameHeight = nBlocksY * blockSize + blockSize;	// alto de la pantalla de juego
var scoreX = nBlocksX * blockSize + 90;				// posicion del marcador de puntuacion

// Dificultad
var level;					// nivel actual
var score = 0;				// puntos totales acumulados
var scoreIncrement = 50;	// puntos recibidos por linea completada
var scoreLevelPlus = 25;	// aumento de puntuacion por nivel completado
var completedLines = 0;		// numero de lineas completadas
var linesThreshold = 10;	// numero de lineas necesarias para completar nivel
var dropSpeedUp = 90;		// aumento de velocidad por nivel completado (ms)

// Jugabilidad

var dropTime = Phaser.Timer.SECOND;		// tiempo que tarde en caer una pieza (1 bloque por s)
var movementLag = 50;					// retardo entre pulsaciones de tecla (ms)
var moveTimer = 0;						// contador para evitar movimientos excesivamente rapidos
var queue = [];							// cola de próximas piezas
var nNext = 1;							// numero máximo de piezas en cola
var pause = false;						// variable de control para pausar el juego
var gameOver = false;					// variable de control para gestionar el fin de partida

// UI
var pauseText;		// texto del menú de pausa
var scoreTitle;		// texto Scores
var scoreText;		// puntuacion
var linesText;		// texto Lines
var shade;			// capa oscura

// Varios
var tetromino;		// el tetromino en juego (player)
var arena;			// el tableto de juego (scene)
var cursors;		// el input de usuario (movimientos)
var rotates;		// el input de usuario (rotaciones)
var pauseButton;	// el input para el menu de pausa
var timer;
var loop;

var GameScene = {

	audioManager: {
		soundOn: true,
		moveSound: null,
		clickSound: null,
		levelSound: null,
		winSound: null,
		gameoverSound: null,
		music: null,

		playMusic: function() {
			if(GameScene.audioManager.soundOn && !pause) {
				GameScene.audioManager.music.resume();
			}
		},

		playSound: function(sound) {
			if(GameScene.audioManager.soundOn && !pause) {
				sound.play();
			}
		},

		toggleSound : function(sprite) {
	        sprite.frame = 1 - sprite.frame;
	        GameScene.audioManager.soundOn = !GameScene.audioManager.soundOn;

	        if(GameScene.audioManager.soundOn) GameScene.audioManager.playMusic();
	        else GameScene.audioManager.music.pause();
	    }
    },

	preload: function() {
		this.game.load.image('grid', 'assets/grid.png');
		this.game.load.image('ground', 'assets/ground.png');		
		this.game.load.image('bricks', 'assets/bricks.png');
		this.game.load.spritesheet('blocks','assets/blocks.png', blockSize, blockSize, nTypes + 1);
    	this.game.load.spritesheet('sound','assets/sound.png', 32, 32);
    	this.game.load.audio('move','assets/sound/move.mp3','assets/sound/move.ogg');    	
    	this.game.load.audio('click','assets/sound/click.mp3','assets/sound/click.ogg');	
    	this.game.load.audio('level','assets/sound/level.mp3','assets/sound/level.ogg');
    	this.game.load.audio('win','assets/sound/win.mp3','assets/sound/win.ogg');
    	this.game.load.audio('gameover','assets/sound/gameover.mp3','assets/sound/gameover.ogg');
	},

	create: function() {

		// Inicializacion del sistema de input
		cursors = this.game.input.keyboard.createCursorKeys();
		rotates = {
			counterClockwise: this.game.input.keyboard.addKey(Phaser.Keyboard.Q),			
			clockwise: this.game.input.keyboard.addKey(Phaser.Keyboard.W)
		};
		rotates.clockwise.onDown.add(this.manageRotateW, this);
		rotates.counterClockwise.onDown.add(this.manageRotateQ, this);
		pauseButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		pauseButton.onDown.add(this.managePauseScreen, this);

		// Creacion del tablero de juego
		arena = new Arena();		

		this.background = this.game.add.tileSprite(0, 0, nBlocksX * blockSize, nBlocksY * blockSize, 'background')
		this.backgroundv = 5;

	    this.middleSeparator = this.game.add.graphics(nBlocksX * blockSize, 0);
	    this.middleSeparator.lineStyle(3, 0xffffff, 1);
	    this.middleSeparator.lineTo(0, this.game.world.height);

	    this.game.add.tileSprite(0, this.game.world.height - blockSize, nBlocksX * blockSize, blockSize,'ground', 0);

	    // Creacion de la interfaz de usuario
	    this.bricks = this.game.add.tileSprite(nBlocksX * blockSize, 0, menuWidth, gameHeight, 'bricks', 0);

	    this.sound = this.game.add.sprite(this.game.world.width - 38, 0, 'sound', 0);
	    this.sound.inputEnabled = true;
	    this.sound.events.onInputDown.add(GameScene.audioManager.toggleSound, this);

	    scoreTitle = this.game.add.bitmapText(nBlocksX * blockSize + 50, 40, 'videogame', 'Score', 40);
	    scoreText = this.game.add.bitmapText(scoreX, 80, 'desyrel', '0', 64);

	    this.linesTitle = this.game.add.bitmapText(nBlocksX * blockSize + 50, 180, 'videogame', 'Lines', 40);
	    linesText = this.game.add.bitmapText(scoreX, 220, 'desyrel', '0', 64);

	    this.nextTitle = this.game.add.bitmapText(nBlocksX * blockSize + 75, 360, 'videogame', 'Next', 40);
	    alignText();

	    this.grid = this.game.add.sprite(nBlocksX * blockSize + 97, 418, 'grid', 0);

	    this.nextTitle.x = scoreTitle.x + scoreTitle.textWidth / 2 - (this.nextTitle.textWidth * 0.5);
	    this.linesTitle.x = scoreTitle.x + scoreTitle.textWidth / 2 - (this.linesTitle.textWidth * 0.5);	   

	    // Inicializacion del drop timer
	    timer = this.game.time.events;
	    loop = timer.loop(dropTime, this.drop, this);
	    timer.start();

	    // Inicializacion del sistema de audio
	    GameScene.audioManager.moveSound = this.game.add.audio('move');	    
	    GameScene.audioManager.clickSound = this.game.add.audio('click');
	    GameScene.audioManager.levelSound = this.game.add.audio('level');
	    GameScene.audioManager.winSound = this.game.add.audio('win');
	    GameScene.audioManager.gameOverSound = this.game.add.audio('gameover');
	    GameScene.audioManager.music = this.game.add.audio('music');
	    GameScene.audioManager.music.volume = 0.8;
	    GameScene.audioManager.music.loopFull();

	    for(let i = 0; i < level; i++) updateTimer();

	    this.manageTetrominos();
	},

	update: function() {
		this.background.tilePosition.y += this.backgroundv;

		moveTimer += this.time.elapsed;

	    if (moveTimer > movementLag) 
	    {	        
	        if (cursors.left.isDown)
	        {
	            if (tetromino.canMove(slide, "left")) tetromino.move(slide, slideCenter, "left");	            
	        }
	        else if (cursors.right.isDown)
	        {
	            if (tetromino.canMove(slide, "right")) tetromino.move(slide, slideCenter, "right");	            
	        }
	        else if (cursors.down.isDown)
	        {
	            if (tetromino.canMove(slide, "down")) tetromino.move(slide, slideCenter, "down");
	        }
	       
	        moveTimer = 0;
	    }
	},

	manageRotateQ: function() {
		if (tetromino.canMove(rotate, "clockwise")) 
			tetromino.move(rotate, null, "clockwise");
	},

	manageRotateW: function() {
		if (tetromino.canMove(rotate, "counterclockwise")) 
			tetromino.move(rotate, null, "counterclockwise");
	},
	
	// Funcion que gestiona la aparición de los tetrominos
	manageTetrominos: function() {

		// Gestionamos la cola de tetrominos
		while(queue.length < nNext + 1) queue.unshift(new Tetromino());
	    tetromino = queue.pop();

	    // Colocamos el tetromino en el tablero
	    var start_x = Math.floor(nBlocksX / 2);
	    var start_y = y_start[tetromino.shape];    
	    var conflict = tetromino.materialize(start_x, start_y, true, this.game);

	    // Gestionamos la pieza siguiente si no hay conflicto
	    if (conflict) this.gameOver();
	    else
	    {
	        for (let i = 0; i < queue.length; i++) 
	        {
	            var s_x = Math.floor((scoreTitle.x + scoreTitle.textWidth / 2) / 32);
	            var s_y = 14;
	            queue[i].materialize(s_x, s_y, false, this.game);
	        }
	    }
	},

	// Funcion que gestiona la caida de los tetronimos
	drop: function() {

	    if (pause || gameOver) { return; }

	    // Desplazamos el tetromino hacia abajo
	    if (tetromino.canMove(slide, "down")) tetromino.move(slide, slideCenter, "down");
	    else
	    { 
	    	// Si no podemos es porque se ha producido una colision con el suelo o con una linea
	    	// Añadimos todas las lineas de nuestro tetromino a una lista
	    	// Realizamos el merge del tetronimo y el tablero de juego
	    	// Comprobamos si alguna de las lineas que ocupa nuestro tetromino esta compelta

	        var lines = [];

	        for(let i = 0; i < tetromino.cells.length; i++)
	        {
	            if (lines.indexOf(tetromino.cells[i][1]) == -1) lines.push(tetromino.cells[i][1]);

	            var x = tetromino.cells[i][0];
	            var y = tetromino.cells[i][1];

	            arena.cells[x][y] = fallenValue;
	            arena.arenaSprites[tetromino.cells[i][0]][tetromino.cells[i][1]] = tetromino.sprites[i];
	        }

	        GameScene.audioManager.playSound(GameScene.audioManager.clickSound);

	        arena.checkLines(lines);
	        this.manageTetrominos();
    	}
	},

	// Funcion que gestiona el fin de partida
	gameOver: function() {
	    gameOver = true;

	    this.makeShade();

	    this.gameover = this.game.add.bitmapText(this.game.world.centerX, this.game.world.centerY, 'videogame', 'GAME OVER', 64);
	    this.gameover.anchor.setTo(0.5);

	    GameScene.audioManager.music.pause();
	    GameScene.audioManager.playSound(GameScene.audioManager.gameOverSound);

	    GameScene.audioManager.gameOverSound.onStop.add(this.manageGameOver, this);
	},

	// Funcion que oscurece la pantalla al finalizar la partida
	makeShade: function() {
	    shade = this.game.add.graphics(0, 0);
	    shade.beginFill(0x000000, 0.6);
	    shade.drawRect(0, 0, this.game.world.width, this.game.world.height);
	    shade.endFill();
	},

	managePauseScreen: function() {

		if(!gameOver)
		{
			pause = !pause;
	    
		    if(pause)
		    {
		        GameScene.audioManager.music.pause();
		        this.makeShade();
		        pauseText = this.game.add.bitmapText(this.game.world.centerX, this.game.world.centerY, 'videogame', 'PAUSE', 64);
		        pauseText.anchor.setTo(0.5);

		    }
		    else
		    {
		        timer.resume();
		        GameScene.audioManager.playMusic();
		        shade.clear();
		        pauseText.destroy();
		    }
		}	    
	},

	manageGameOver: function() {
		this.game.state.start('gameover');
	}
};


<!--FUNCIONES AUXILIARES-->

// Funcion que alinea el texto
function alignText() {
    var center = scoreTitle.x + scoreTitle.textWidth / 2;
    scoreText.x = center - (scoreText.textWidth * 0.5);
    linesText.x = center - (linesText.textWidth * 0.5);
}

// Función que actualiza la UI
function updateScore() {
    completedLines++;
    score += scoreIncrement;

    scoreText.text = score;
    linesText.text = completedLines;

    alignText();
    updateTimer();
}

// Funcion que aumenta el nivel, la dificultad y la recompensa
function updateTimer() {
    if(completedLines % linesThreshold == 0) 
    {
    	if(level < 9)
    	{
    		level++;
        	loop.delay -= dropSpeedUp;
        	GameScene.audioManager.playSound(GameScene.audioManager.levelSound);
    	}    	    	
        scoreIncrement += scoreLevelPlus;
    }
}