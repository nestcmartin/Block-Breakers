'use strict';

// Dimensiones
var nBlocks = 4;							// numero de bloques por tetromino
var nTypes = 7;								// numero de tipos de tetromino
var blockSize = 32;							// tamaño de los bloques en pixels
var nBlocksX = 12;							// numero de bloques de ancho
var nBlocksY = 20;							// numero de bloques de alto
var menuWidth = 300;						// tamaño del menu principal
var arenaWidth = nBlocksX * blockSize;		// ancho del tablero de juego
var arenaHeight = nBlocksY * blockSize;		// alto del tablero de juego
var gameWidth = arenaWidth + menuWidth;		// ancho de la pantalla de juego
var gameHeight = arenaHeight + blockSize;	// alto de la pantalla de juego
var scoreX = arenaWidth + 90;				// posicion del marcador de puntuacion

// Dificultad
var level = 0;				// nivel actual
var score = 0;				// puntos totales acumulados
var scoreIncrement = 50;	// puntos recibidos por linea completada
var scoreLevelPlus = 25;	// aumento de puntuacion por nivel completado
var completedLines = 0;		// numero de lineas completadas
var linesThreshold = 10;	// numero de lineas necesarias para completar nivel
var dropSpeedUp = 90;		// aumento de velocidad por nivel completado (ms)

// Jugabilidad
var fallenValue = 1;					// valor que toman en la matriz las casillas ocupadas
var fallingValue = 2;					// valor que toman en la matriz las casillas en juego
var dropTime = Phaser.Timer.SECOND;		// tiempo que tarde en caer una pieza (1 bloque por s)
var movementLag = 50;					// retardo entre pulsaciones de tecla (ms)
var moveTimer = 0;						// contador para evitar movimientos excesivamente rapidos
var queue = [];							// cola de próximas piezas
var nNext = 1;							// numero máximo de piezas en cola
var pause = false;						// variable de control para pausar el juego
var gameOver = false;					// variable de control para gestionar el fin de partida

// Tetrominos
var offsets = {							// posiciones de cada bloque en cada tetromino
    0 : [[0,-1],[0,0],[0,1],[1,1]], 	// L
    1 : [[0,-1],[0,0],[0,1],[-1,1]], 	// J
    2 : [[-1,0],[0,0],[1,0],[2,0]], 	// I
    3 : [[-1,-1],[0,-1],[0,0],[-1,0]], 	// O
    4 : [[-1,0],[0,0],[0,-1],[1,-1]],	// S
    5 : [[-1,0],[0,0],[1,0],[0,1]], 	// T
    6 : [[-1,-1],[0,-1],[0,0],[1,0]] 	// Z
};
var y_start = {		// posicion y de inicio de cada tetromino
    0 : 1,			// L
    1 : 1,			// J
    2 : 0,			// I
    3 : 1,			// O
    4 : 1,			// S
    5 : 0,			// T
    6 : 1			// Z
};
var move_offsets = {	// cantidad de celdas[x, y] en cada movimiento
    "left" : [-1,0],	// izquierda
    "down" : [0,1],		// abajo
    "right" : [1,0]		// derecha
};

// UI
var pauseText;
var scoreTitle;
var scoreText;
var linesText;
var shade;

// Varios
var tetromino;		// el tetromino en juego (player)
var arena;			// el tableto de juego (scene)
var arenaSprites;	// los sprites del tablero de juego (sceneSprites)
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
		arena = [];
		arenaSprites = [];

		for (let i = 0; i < nBlocksX; i++) 
		{
			let col = [];
			let spriteCol = [];

			for(let j = 0; j < nBlocksY; j++) 
			{
				col.push(0);
				spriteCol.push(null);
			}

			arena.push(col);
			arenaSprites.push(spriteCol);
		}

		this.background = this.game.add.tileSprite(0, 0, arenaWidth, arenaHeight, 'background')
		this.backgroundv = 5;

	    this.middleSeparator = this.game.add.graphics(arenaWidth, 0);
	    this.middleSeparator.lineStyle(3, 0xffffff, 1);
	    this.middleSeparator.lineTo(0, this.game.world.height);

	    this.game.add.tileSprite(0, this.game.world.height - blockSize, arenaWidth, blockSize,'ground', 0);

	    // Creacion de la interfaz de usuario
	    this.bricks = this.game.add.tileSprite(arenaWidth, 0, menuWidth, gameHeight, 'bricks', 0);

	    this.sound = this.game.add.sprite(this.game.world.width - 38, 0, 'sound', 0);
	    this.sound.inputEnabled = true;
	    this.sound.events.onInputDown.add(GameScene.audioManager.toggleSound, this);

	    scoreTitle = this.game.add.bitmapText(arenaWidth + 50, 40, 'videogame', 'Score', 40);
	    scoreText = this.game.add.bitmapText(scoreX, 80, 'desyrel', '0', 64);

	    this.linesTitle = this.game.add.bitmapText(arenaWidth + 50, 180, 'videogame', 'Lines', 40);
	    linesText = this.game.add.bitmapText(scoreX, 220, 'desyrel', '0', 64);

	    this.nextTitle = this.game.add.bitmapText(arenaWidth + 75, 360, 'videogame', 'Next', 40);
	    alignText();

	    this.grid = this.game.add.sprite(arenaWidth + 97, 418, 'grid', 0);

	    this.nextTitle.x = scoreTitle.x + scoreTitle.textWidth / 2 - (this.nextTitle.textWidth * 0.5);
	    this.linesTitle.x = scoreTitle.x + scoreTitle.textWidth / 2 - (this.linesTitle.textWidth * 0.5);

	    this.manageTetrominos();	   

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
	},

	update: function() {
		this.background.tilePosition.y += this.backgroundv;

		moveTimer += this.time.elapsed;

	    if (moveTimer > movementLag) 
	    {	        
	        if (cursors.left.isDown)
	        {
	            if (canMove(slide, "left")) move(slide, slideCenter, "left");	            
	        }
	        else if (cursors.right.isDown)
	        {
	            if (canMove(slide, "right")) move(slide, slideCenter, "right");	            
	        }
	        else if (cursors.down.isDown)
	        {
	            if (canMove(slide, "down")) move(slide, slideCenter, "down");
	        }
	       
	        moveTimer = 0;
	    }
	},

	manageRotateQ: function() {
		if (canMove(rotate, "clockwise")) 
			move(rotate, null, "clockwise");
	},

	manageRotateW: function() {
		if (canMove(rotate, "counterclockwise")) 
			move(rotate, null, "counterclockwise");
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
	    if (canMove(slide, "down")) move(slide, slideCenter, "down");
	    else
	    { 
	    	// Si no podemos es porque se ha producido una colision con el suelo o con una linea
	    	// Añadimos todas las lineas de nuestro tetromino a una lista
	    	// Realizamos el merge del tetronimo y el tablero de juego
	    	// Comprobamos si alguna de las lineas que ocupa nuestro tetromino esta compelta
	    	GameScene.audioManager.playSound(GameScene.audioManager.clickSound);

	        var lines = [];

	        for(let i = 0; i < tetromino.cells.length; i++)
	        {
	            if (lines.indexOf(tetromino.cells[i][1]) == -1) lines.push(tetromino.cells[i][1]);

	            var x = tetromino.cells[i][0];
	            var y = tetromino.cells[i][1];

	            arena[x][y] = fallenValue;
	            arenaSprites[tetromino.cells[i][0]][tetromino.cells[i][1]] = tetromino.sprites[i];
	        }

	        this.checkLines(lines);
	        this.manageTetrominos();
    	}
	},

	// Funcion que gestiona la eliminacion de lineas
	checkLines: function(lines) {

	    this.collapsedLines = [];

	    for(let i = 0; i < lines.length; i++)
	    {
	        var sum = lineSum(lines[i]);

	        if (sum == (nBlocksX * fallenValue)) 
	        {
	            
	            this.collapsedLines.push(lines[i]);            
	            this.cleanLine(lines[i]);
	            updateScore();

	            GameScene.audioManager.playSound(GameScene.audioManager.winSound);
	        }
	    }

	    if (this.collapsedLines.length) this.collapse(this.collapsedLines);
	},

	// Funcion que limpia una linea completa
	cleanLine: function(line) {

	    this.delay = 0;

	    for (let i = 0; i < nBlocksX; i++) 
	    {
	        this.tween = this.game.add.tween(arenaSprites[i][line]);
	        this.tween.to( { y: 0 }, 500, null, false, this.delay);
	        this.tween.onComplete.add(destroy, this);
	        this.tween.start();

	        arenaSprites[i][line] = null;
	        arena[i][line] = 0;

	        this.delay += 50;
	    }
	},

	// Funcion que colapsa las lineas especificadas 
	collapse: function(lines) {

	    this.min = 999;

	    // Solo colapsan las lineas por encima de la linea mas alta
	    for(let i = 0; i < lines.length; i++)
	    {
	        if(lines[i] < this.min) this.min = lines[i];
	    }
	    
	    for(let i = this.min - 1; i >= 0; i--)
	    {
	        for(let j = 0; j < nBlocksX; j++)
	        {
	            if(arenaSprites[j][i]) 
	            {
	                arenaSprites[j][i + lines.length] = arenaSprites[j][i];
	                arenaSprites[j][i] = null;
	                arena[j][i + lines.length] = fallenValue;
	                arena[j][i] = 0;

	                this.tween = this.game.add.tween(arenaSprites[j][i + lines.length]);
	                this.new_y = arenaSprites[j][i + lines.length].y + (lines.length * blockSize);
	                this.tween.to( { y: this.new_y }, 500, null, false);
	                this.tween.start();
	            }
	        }
	    }    
	},

	// Funcion que gestiona el fin de partida
	gameOver: function() {
	    gameOver = true;

	    GameScene.audioManager.music.pause();
	    GameScene.audioManager.playSound(GameScene.audioManager.gameOverSound);

	    this.makeShade();

	    this.gameover = this.game.add.bitmapText(this.game.world.centerX, this.game.world.centerY, 'videogame', 'GAME OVER', 64);
	    this.gameover.anchor.setTo(0.5);
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
	}
};


<!--FUNCIONES AUXILIARES-->

<!--MOVIMIENTO-->
// Funcion que valida las coordenadas de un bloque
function validateCoordinates(new_x, new_y) {
    if(new_x < 0 || new_x > nBlocksX - 1) {
        console.log('Out of X bounds');
        return false;
    }
    if(new_y < 0 || new_y > nBlocksY - 1) {
        console.log('Out of Y bounds');
        return false;
    }
    if(arena[new_x][new_y] == fallenValue) {
        console.log('Cell is occupied');
        return false;
    }
    return true;
}

// Funcion que desplaza un bloque en una direccion
function slide(block, dir) {
    var new_x = tetromino.cells[block][0] + move_offsets[dir][0];
    var new_y = tetromino.cells[block][1] + move_offsets[dir][1];
    return [new_x, new_y];
}

// Funcion que desplaza el centro de un tetromino en una direccion
function slideCenter(dir) {
    var new_center_x = tetromino.center[0] + move_offsets[dir][0];
    var new_center_y = tetromino.center[1] + move_offsets[dir][1];
    return [new_center_x,new_center_y];
}

// Funcion que aplica una rotacion a un bloque
function rotate(block, dir) {
    var c_x = tetromino.center[0];
    var c_y = tetromino.center[1];
    var offset_x = tetromino.cells[block][0] - c_x;
    var offset_y = tetromino.cells[block][1] - c_y;

    offset_y = -offset_y;
    var new_offset_x = ((dir == "clockwise")) ? offset_y : -offset_y;
    var new_offset_y = ((dir == "clockwise")) ? -offset_x : offset_x;
    new_offset_y = -new_offset_y;

    var new_x = c_x + new_offset_x;
    var new_y = c_y + new_offset_y;
    return [new_x, new_y];
}

// Funcion que comprueba si el movimiento deseado (callback) no genera conflicto
function canMove(coordinatesCallback, dir) {
    
    if(pause) return false;

    for(let i = 0; i < tetromino.cells.length; i++)
    {
        var new_coord = coordinatesCallback(i, dir);
        var new_x = new_coord[0];
        var new_y = new_coord[1];
        
        if (!validateCoordinates(new_x, new_y)) return false;
    }

    return true;
}

// Funcion que aplica el movimiento deseado (callback) a un tetromino
function move(coordinatesCallback, centerCallback, dir) {
    
    // Aplicamos el movimiento a todos los bloques
    // Actualizamos el tablero de juego
    for (let i = 0; i < tetromino.cells.length; i++)
    {
        var old_x = tetromino.cells[i][0];
        var old_y = tetromino.cells[i][1];
        var new_coord = coordinatesCallback(i, dir);
        var new_x = new_coord[0];
        var new_y = new_coord[1];

        tetromino.cells[i][0] = new_x;
        tetromino.cells[i][1] = new_y;
        tetromino.sprites[i].x = new_x * blockSize;
        tetromino.sprites[i].y = new_y * blockSize;

        arena[old_x][old_y] = 0;
        arena[new_x][new_y] = fallingValue;
    }

    // Actualizamos el centro del tetromino
    if (centerCallback) 
    {
        var center_coord = centerCallback(dir);
        tetromino.center = [center_coord[0], center_coord[1]];
    }

    if (dir !== "down") GameScene.audioManager.playSound(GameScene.audioManager.moveSound);
}

<!--LÍNEAS-->
// Funcion que suma el valor de una linea
function lineSum(l) {
    var sum = 0;
    for (let i = 0; i < nBlocksX; i++) sum += arena[i][l];
    return sum;
}

// Funcion que destruye un sprite
function destroy(sprite) {
    sprite.destroy();
}

<!--UI-->
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