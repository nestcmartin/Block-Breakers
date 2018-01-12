'use strict';

var offsets = {                         // posiciones de cada bloque en cada tetromino
    0 : [[0,-1],[0,0],[0,1],[1,1]],     // L
    1 : [[0,-1],[0,0],[0,1],[-1,1]],    // J
    2 : [[-1,0],[0,0],[1,0],[2,0]],     // I
    3 : [[-1,-1],[0,-1],[0,0],[-1,0]],  // O
    4 : [[-1,0],[0,0],[0,-1],[1,-1]],   // S
    5 : [[-1,0],[0,0],[1,0],[0,1]],     // T
    6 : [[-1,-1],[0,-1],[0,0],[1,0]]    // Z
};
var y_start = {     // posicion y de inicio de cada tetromino
    0 : 1,          // L
    1 : 1,          // J
    2 : 0,          // I
    3 : 1,          // O
    4 : 1,          // S
    5 : 0,          // T
    6 : 1           // Z
};
var move_offsets = {    // cantidad de celdas[x, y] en cada movimiento
    "left" : [-1,0],    // izquierda
    "down" : [0,1],     // abajo
    "right" : [1,0]     // derecha
};

class Tetromino
{
    constructor() {
        this.shape = Math.floor(Math.random() * nTypes);    // forma del tetromino

        this.center = [0,0];    // centro de la matriz del tetromino
        this.sprites = [];      // sprites que utiliza el tetromino
        this.cells = [];        // matriz que ocupa el tetromino   
    }	 
    
    // Funcion que materializa el tetromino
    // c_x, c_y: centro del tetromino
    // inGame:   true en el tablero, false en next
    materialize(c_x, c_y, inGame, game) {
        for (let i = 0; i < this.sprites.length; i++) this.sprites[i].destroy();

        this.center = [c_x,c_y];
        this.sprites = [];
        this.cells = [];        

        var conflict = false;

        for (let i = 0; i < nBlocks; i++) 
        {
            // Obtenemos las coordenadas del bloque
            var x = c_x + offsets[this.shape][i][0];
            var y = c_y + offsets[this.shape][i][1];

            // Cargamos el sprite del bloque
            var sprite = game.add.sprite(x * blockSize, y * blockSize, 'blocks', this.shape);
            this.sprites.push(sprite);

            // Cargamos el bloque en la matriz
            this.cells.push([x, y]);
            if (inGame) 
            {
                if(!this.validateCoordinates(x,y)) conflict = true;
                arena.cells[x][y] = fallingValue;
            }
        }
        return conflict;
    }

    // Funcion que valida las coordenadas de un bloque
    validateCoordinates(new_x, new_y) {
        if(new_x < 0 || new_x > nBlocksX - 1) {
            return false;
        }
        if(new_y < 0 || new_y > nBlocksY - 1) {
            return false;
        }
        if(arena.cells[new_x][new_y] == fallenValue) {
            return false;
        }
        return true;
    }

    // Funcion que comprueba si el movimiento deseado (callback) no genera conflicto
    canMove(coordinatesCallback, dir) {
        
        if(pause) return false;

        for(let i = 0; i < this.cells.length; i++)
        {
            var new_coord = coordinatesCallback(i, dir);
            var new_x = new_coord[0];
            var new_y = new_coord[1];
            
            if (!this.validateCoordinates(new_x, new_y)) return false;
        }

        return true;
    }

    // Funcion que aplica el movimiento deseado (callback) a un tetromino
    move(coordinatesCallback, centerCallback, dir) {
        
        // Aplicamos el movimiento a todos los bloques
        // Actualizamos el tablero de juego
        for (let i = 0; i < this.cells.length; i++)
        {
            var old_x = this.cells[i][0];
            var old_y = this.cells[i][1];
            var new_coord = coordinatesCallback(i, dir);
            var new_x = new_coord[0];
            var new_y = new_coord[1];

            this.cells[i][0] = new_x;
            this.cells[i][1] = new_y;
            this.sprites[i].x = new_x * blockSize;
            this.sprites[i].y = new_y * blockSize;

            arena.cells[old_x][old_y] = 0;
            arena.cells[new_x][new_y] = fallingValue;
        }

        // Actualizamos el centro del this
        if (centerCallback) 
        {
            var center_coord = centerCallback(dir);
            this.center = [center_coord[0], center_coord[1]];
        }

        if (dir !== "down") audioManager.playSound(audioManager.moveSound);
    }
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