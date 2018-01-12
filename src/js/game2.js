'use strict';

var arena2;
var tetromino2;
var loop2;

var Game2Scene = {

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

		audioManager = new AudioManager();

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
		arena2 = new Arena();	

		this.background = this.game.add.tileSprite(0, 0, nBlocksX * blockSize, nBlocksY * blockSize, 'background')
		this.background2 = this.game.add.tileSprite(nBlocksX * blockSize + menuWidth, 0, nBlocksX * blockSize, nBlocksY * blockSize, 'background')
		this.backgroundv = 5;		

	    this.middleSeparator = this.game.add.graphics(nBlocksX * blockSize, 0);
	    this.middleSeparator.lineStyle(3, 0xffffff, 1);
	    this.middleSeparator.lineTo(0, this.game.world.height);
	    this.middleSeparator2 = this.game.add.graphics(nBlocksX * blockSize + menuWidth, 0);
	    this.middleSeparator2.lineStyle(3, 0xffffff, 1);
	    this.middleSeparator2.lineTo(0, this.game.world.height);

	    this.game.add.tileSprite(0, this.game.world.height - blockSize, nBlocksX * blockSize, blockSize,'ground', 0);
	    this.game.add.tileSprite(nBlocksX * blockSize + menuWidth, this.game.world.height - blockSize, nBlocksX * blockSize, blockSize,'ground', 0);

	    // Creacion de la interfaz de usuario
	    this.bricks = this.game.add.tileSprite(nBlocksX * blockSize, 0, menuWidth, gameHeight, 'bricks', 0);

	    this.sound = this.game.add.sprite(this.game.world.width - 38, 0, 'sound', 0);
	    this.sound.inputEnabled = true;
	    this.sound.events.onInputDown.add(audioManager.toggleSound, this);

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
	    loop = timer.loop(dropTime, function() { this.drop(tetromino) }, this);
	    loop2 = timer.loop(dropTime, function() { this.drop(tetromino2) }, this);
	    timer.start();

	    // Inicializacion del sistema de audio
	    audioManager.moveSound = this.game.add.audio('move');	    
	    audioManager.clickSound = this.game.add.audio('click');
	    audioManager.levelSound = this.game.add.audio('level');
	    audioManager.winSound = this.game.add.audio('win');
	    audioManager.gameOverSound = this.game.add.audio('gameover');
	    audioManager.music = this.game.add.audio('music');
	    audioManager.music.volume = 0.8;
	    audioManager.music.loopFull();

	    selectLevel(level);

	    this.manageTetrominos();
	},

	update: function() {
		this.background.tilePosition.y += this.backgroundv;
		this.background2.tilePosition.y += this.backgroundv;

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
		tetromino = new Tetromino();
	    tetromino2 = new Tetromino();

	    // Colocamos el tetromino en el tablero
	    var start_x = Math.floor(nBlocksX / 2);
	    var start_y = y_start[tetromino.shape];    
	    var conflict = tetromino.materialize(start_x, start_y, true, this.game);

	    var start_x2 = Math.floor(gameWidth - nBlocksX / 2);
	    var start_y2 = y_start[tetromino2.shape];    
	    var conflict2 = tetromino2.materialize(start_x2, start_y2, true, this.game);
	    
	    if (conflict) this.gameOver();
	    if (conflict2) this.gameOver();
	},

	// HAY QUE PASAR LA ARENA
	// Funcion que gestiona la caida de los tetronimos
	drop: function(tetr) {

	    if (pause || gameOver) { return; }

	    // Desplazamos el tetromino hacia abajo
	    if (tetr.canMove(slide, "down")) tetr.move(slide, slideCenter, "down");
	    else
	    { 
	    	// Si no podemos es porque se ha producido una colision con el suelo o con una linea
	    	// Añadimos todas las lineas de nuestro tetromino a una lista
	    	// Realizamos el merge del tetronimo y el tablero de juego
	    	// Comprobamos si alguna de las lineas que ocupa nuestro tetromino esta compelta

	        var lines = [];

	        for(let i = 0; i < tetr.cells.length; i++)
	        {
	            if (lines.indexOf(tetr.cells[i][1]) == -1) lines.push(tetr.cells[i][1]);

	            var x = tetr.cells[i][0];
	            var y = tetr.cells[i][1];

	            arena.cells[x][y] = fallenValue;
	            arena.arenaSprites[tetr.cells[i][0]][tetr.cells[i][1]] = tetr.sprites[i];
	        }

	        audioManager.playSound(audioManager.clickSound);

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

	    audioManager.music.pause();
	    audioManager.playSound(audioManager.gameOverSound);

	    audioManager.gameOverSound.onStop.add(this.manageGameOver, this);
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
		        audioManager.music.pause();
		        this.makeShade();
		        pauseText = this.game.add.bitmapText(this.game.world.centerX, this.game.world.centerY, 'videogame', 'PAUSE', 64);
		        pauseText.anchor.setTo(0.5);

		    }
		    else
		    {
		        timer.resume();
		        audioManager.playMusic();
		        shade.clear();
		        pauseText.destroy();
		    }
		}	    
	},

	manageGameOver: function() {
		level = 0;
		timer.stop();
		this.game.state.start('gameover');
	}
};