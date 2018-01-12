'use strict';

var fallenValue = 1;		// valor que toman en la matriz las casillas ocupadas
var fallingValue = 2;		// valor que toman en la matriz las casillas en juego

class Arena 
{
	constructor() {
		this.arenaWidth = nBlocksX * blockSize;			// ancho del tablero de juego
		this.arenaHeight = nBlocksY * blockSize;		// alto del tablero de juego
		this.cells = [];								// matriz que ocupa el tablero de juego
		this.arenaSprites = [];							// los sprites del tablero de juego

		for (let i = 0; i < nBlocksX; i++) 
		{
			let col = [];
			let spriteCol = [];

			for(let j = 0; j < nBlocksY; j++) 
			{
				col.push(0);
				spriteCol.push(null);
			}

			this.cells.push(col);
			this.arenaSprites.push(spriteCol);
		}
	}

	// Funcion que suma el valor de una linea
	lineSum(l) {
	    var sum = 0;
	    	for (let i = 0; i < nBlocksX; i++) sum += this.cells[i][l];
	    return sum;
	}

	// Funcion que gestiona la eliminacion de lineas
	checkLines(lines) {

	    this.collapsedLines = [];

	    for(let i = 0; i < lines.length; i++)
	    {
	        var sum = this.lineSum(lines[i]);

	        if (sum == (nBlocksX * fallenValue)) 
	        {
	            
	            this.collapsedLines.push(lines[i]);            
	            this.cleanLine(lines[i]);
	            updateScore();

	            audioManager.playSound(audioManager.winSound);
	        }
	    }

	    if (this.collapsedLines.length) this.collapse(this.collapsedLines);
	}

	// Funcion que limpia una linea completa
	cleanLine(line) {

	    this.delay = 0;

	    for (let i = 0; i < nBlocksX; i++) 
	    {
	        animateClean(i, line, this.delay);

	        this.arenaSprites[i][line] = null;
	        this.cells[i][line] = 0;

	        this.delay += 50;
	    }
	}

	// Funcion que colapsa las lineas especificadas 
	collapse(lines) {

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
	            if(this.arenaSprites[j][i]) 
	            {
	                this.arenaSprites[j][i + lines.length] = this.arenaSprites[j][i];
	                this.arenaSprites[j][i] = null;
	                this.cells[j][i + lines.length] = fallenValue;
	                this.cells[j][i] = 0;

	                animateCollapse(i, j, lines.length);
	            }
	        }
	    }    
	}
}

// Funcion que destruye un sprite
function destroy(sprite) {
    sprite.destroy();
}

function animateClean(i, line, delay) {
	var tween = GameScene.game.add.tween(arena.arenaSprites[i][line]);
    tween.to( { y: 0 }, 500, null, false, delay);
    tween.onComplete.add(destroy, this);
    tween.start();
}

function animateCollapse(i, j, length) {
	var tween = GameScene.game.add.tween(arena.arenaSprites[j][i + length]);
    var new_y = arena.arenaSprites[j][i + length].y + (length * blockSize);
    tween.to( { y: new_y }, 500, null, false);
    tween.start();
}