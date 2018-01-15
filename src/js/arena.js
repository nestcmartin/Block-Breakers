'use strict';

class Arena 
{
	constructor(posX, posY, width, height, tetris, game) {

		// Punteros
		this.tetris = tetris;
		this.game = game;
    	
    	// Atributos
    	this.sprites = this.game.add.group();
        this.pos = {x: posX, y: posY};
        this.matrix = [];

        while (height--) {
            this.matrix.push(new Array(width).fill(0));
        }
    }

    clear() {
    	// Reiniciamos la matriz a 0
        this.matrix.forEach(row => row.fill(0));
    }

    collide(player) {

        const [m, pos] = [player.matrix, player.pos];

        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 && (this.matrix[y + pos.y] && this.matrix[y + pos.y][x + pos.x]) !== 0) 
                {
                    return true;
                }
            }
        }
        return false;
    }

    merge(player) {

        // Fusionamos el tetromino con el tablero
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.matrix[y + player.pos.y][x + player.pos.x] = value;
                    var sprite = this.sprites.create((player.pos.x + x) * blockSize, 
                        (player.pos.y + y) * blockSize, 'blocks', value - 1);
                }
            });
        });
    }

    sweep() {

    	// Comprobamos las filas desde abajo
        outer: for (let y = this.matrix.length - 1; y > 0; --y) {
            for (let x = 0; x < this.matrix[y].length; ++x) {
                if (this.matrix[y][x] === 0) {
                    continue outer;
                }
            }

            const row = this.matrix.splice(y, 1)[0].fill(0);
            this.matrix.unshift(row);
            ++y;

            this.tetris.score += this.tetris.scoreIncrement;
            this.tetris.completedLines++;
            this.tetris.updateUI();

            this._animateClean();
            
            audioManager.playSound(audioManager.winSound);
        }
	}

	_sweepSprites() {
        // Limpiamos el grupo
        this.sprites.forEachAlive(function(sprite) { sprite.kill(); });

        // Asignamos los sprites
        this.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    var sprite = this.sprites.create((this.pos.x + x) * blockSize, 
                        (this.pos.y + y) * blockSize, 'blocks', value - 1);
                }
            });
        });
    }

    _animateClean() {
		var tween = this.game.add.tween(this.sprites);
	    tween.to( { alpha: 0 }, 300, Phaser.Easing.Linear.None, true, 0, 0, false);
	    tween.onComplete.add(this._sweepSprites, this);
	    tween.onComplete.add(this._restoreAlpha, this);
	}

	_restoreAlpha() {
		var tween = this.game.add.tween(this.sprites);
	    tween.to( { alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 0, 0, false);
	}
}