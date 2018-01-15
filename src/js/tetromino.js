'use strict';

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
            finalScore = this.tetris.score;
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
                    var sprite = this.sprites.create((this.pos.x + x) * blockSize, 
                        (this.pos.y + y) * blockSize, 'blocks', value - 1);
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
    }
}