'use strict';

var BOMB_RADIUS = 3;

class Tetromino {

    constructor(tetris, game) {

        // Punteros
        this.game = game;
        this.tetris = tetris;
        this.arena = tetris.arena;

        // Atributos
        this.type = 0;        
        this.matrix = [];
        this.sprites = this.game.add.group();        
        this.dropInterval = DROP_TIME;
        this.pos = {x: 0, y: 0};
        this.queue = [];

        this.reset();
    }

    reset() {

        // Gestionamos la cola de tetrominos
        while(this.queue.length < QUEUE_SIZE) this.queue.unshift(PIECES.length * Math.random() | 0);

        // Creamos la pieza aleatoriamente
        this.type = this.queue.pop();        
        this.matrix = createPiece(PIECES[this.type]);

        // Colocamos la pieza en el tablero
        this.pos.y = 0;
        this.pos.x = this.arena.pos.x + (this.arena.matrix[0].length / 2 | 0) - (this.matrix[0].length / 2 | 0);
        
        // Comprobamos colisiones
        if (this.arena.collide(this)) {
            gameover = true;
        }
        else this._placeSprites();
    }

    _placeSprites() {

        // Limpiamos el grupo
        this.sprites.forEachAlive(function(sprite) { sprite.kill(); });

        // Asignamos los sprites
        this.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    var sprite = this.sprites.create((this.pos.x + x) * BLOCK_SIZE, 
                        (this.pos.y + y) * BLOCK_SIZE, 'blocks', value - 1);
                }
            });
        });
    }

    drop() {
        
        // Movemos el tetromino
        this.pos.y++;
        
        // Comprobamos colisiones
        if (this.arena.collide(this)) {
            
            this.pos.y--;
            this.arena.merge(this);
            audioManager.playSound(audioManager.clickSound); 

            if (this.type === 7) this.explode();

            this.reset();

            this.arena.sweep();
        }
        else this._placeSprites();
    }

    fastDrop(dir) {

        // Movemos el tetromino
        this.pos.y += dir;

        // Comprobamos colisiones
        if (this.arena.collide(this)) {
            this.pos.y -= dir;
        }
        else this._placeSprites();
    }

    move(dir) {

        // Movemos el tetromino
        this.pos.x += dir;

        // Comprobamos colisiones
        if (this.arena.collide(this)) {
            this.pos.x -= dir;
        }
        else {
            this._placeSprites();
            audioManager.playSound(audioManager.moveSound);
        }
    }    

    rotate(dir) {

        // Movemos el tetromino        
        this._rotateMatrix(this.matrix, dir);

        // Comprobamos colisiones
        let offset = 1;
        const pos = this.pos.x;

        while (this.arena.collide(this)) {

            this.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));

            if (offset > this.matrix[0].length) {

                this._rotateMatrix(this.matrix, -dir);
                this.pos.x = pos;
                return;
            }
        }

        this._placeSprites();
        audioManager.playSound(audioManager.moveSound);
    }

    _rotateMatrix(matrix, dir) {

        if (this.type === 'O') return;

        // Trasponemos la matriz
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x],
                ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
            }
        }

        // Invertimos la matriz
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } 
        else {
            matrix.reverse();
        }
    }

    explode() {

        for(let y = this.pos.y; y < this.pos.y + BOMB_RADIUS; y++)
        {
            for(let x = this.pos.x; x < this.pos.x + BOMB_RADIUS; x++)
            {
                if (((x >= 0 + this.tetris.arena.pos.x) && (x < BLOCKS_X + this.tetris.arena.pos.x)) && ((y < BLOCKS_Y) && (y >= 0))) {
                    this.tetris.arena.matrix[y][x - this.tetris.arena.pos.x] = 0;
                }    
            }
        }

        this.tetris.arena._sweepSprites();

        var explosion = this.game.add.sprite(this.pos.x * BLOCK_SIZE, this.pos.y * BLOCK_SIZE, 'boom');
        var explode = explosion.animations.add('explode');
        explosion.animations.play('explode', 30, false);
        audioManager.playSound(audioManager.boomSound);
        explode.onComplete.add(function() { this._destroySprite(explosion) }, this);
    }

    _destroySprite(sprite) {
        sprite.kill();
    }
}

function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    } else if (type === 'B') {
        return [
            [0, 0, 0,],
            [0, 8, 0,],
            [0, 0, 0,],
        ];
    }
}