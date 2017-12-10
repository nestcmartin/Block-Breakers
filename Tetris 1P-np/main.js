
var element = document.querySelector('.player');
const tetris = new Tetris(element);

const keyListener = (event) => {
    const player = tetris.player;
    if (event.type === 'keydown') {
    	if (event.keyCode === 37){
    		player.move(-1);
    	} else if (event.keyCode === 39) {
    		player.move(1);
    	} else if (event.keyCode === 81) {
    		player.rotate(-1);
    	} else if (event.keyCode === 87) {
    		player.rotate(1);
    	}
    }

    if (event.keyCode === 40) {
        if (event.type === 'keydown') {
            if (player.dropInterval !== player.DROP_FAST) {
                player.drop();
                player.dropInterval = player.DROP_FAST;
            }
        } else {
            player.dropInterval = player.DROP_SLOW;
        }
    }
};

document.addEventListener('keydown', keyListener);
document.addEventListener('keyup', keyListener);