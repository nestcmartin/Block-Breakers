'use strict';

class Tetromino
{
    constructor()
    {
        this.shape = Math.floor(Math.random() * nTypes);    // forma del tetromino
        //this.color = Math.floor(Math.random() * nTypes);    // color del tetromino

        this.center = [0,0];    // centro de la matriz del tetromino
        this.sprites = [];      // sprites que utiliza el tetromino
        this.cells = [];        // matriz que ocupa el tetromino   
    }	 
    
    // Funcion que materializa el tetromino
    // c_x: 	centro X del tetromino
    // c_y: 	centro Y del tetromino
    // inGame:  true en el tablero, false en next
    materialize(c_x, c_y, inGame, game) 
    {
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
                if(!validateCoordinates(x,y)) conflict = true;
                arena[x][y] = fallingValue;
            }
        }
        return conflict;
    };
}