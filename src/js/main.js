'use strict';

window.onload = function () {

  // The Game; you loose
  var game = new Phaser.Game(GAME_W, GAME_H, Phaser.AUTO, 'game');

  // Creamos los estados de juego
  game.state.add('boot', BootScene);            // Carga de assets para la pantalla de carga
  game.state.add('preloader', PreloaderScene);  // Carga de assets para el juego
  game.state.add('menu', MenuScene);            // Pantalla de menú principal
  game.state.add('game', GameScene);            // La escena de juego principal
  game.state.add('game2', Game2Scene);          // La escena de juego pvp
  game.state.add('gameover', GameoverScene);    // El final del juego

  // Iniciamos el juego
  game.state.start('boot');
};


var BootScene = {
  preload: function () {
    this.game.load.image('preloader_bar', 'assets/preloader_bar.png');
  },

  create: function () {
    this.game.state.start('preloader');
  }
};


var PreloaderScene = {
  preload: function () {

    //this.game.load.baseURL = 'https://nestorcabrero.github.io/TetrisPVLI/src/';
    this.game.load.crossOrigin = 'anonymous';

    this.loadingBar = this.game.add.sprite(0, 240, 'preloader_bar');
    this.loadingBar.anchor.setTo(0, 0.5);
    this.load.setPreloadSprite(this.loadingBar);

    // Cargamos las fuentes
    this.game.load.bitmapFont('gameover', 'assets/fonts/gameover.png', 'assets/fonts/gameover.fnt');
    this.game.load.bitmapFont('videogame', 'assets/fonts/videogame.png', 'assets/fonts/videogame.fnt');
    this.game.load.bitmapFont('desyrel', 'assets/fonts/desyrel.png', 'assets/fonts/desyrel.xml');

    // Cargamos los botones del menú principal
    this.game.load.spritesheet('button', 'assets/p1.png', 137, 37);    
    this.game.load.spritesheet('button2', 'assets/p2.png', 137, 37);
    this.game.load.spritesheet('level00', 'assets/level00.png', 137, 37);
    this.game.load.spritesheet('level01', 'assets/level01.png', 137, 37);   
    this.game.load.spritesheet('level02', 'assets/level02.png', 137, 37);
    this.game.load.spritesheet('level03', 'assets/level03.png', 137, 37);
    this.game.load.spritesheet('level04', 'assets/level04.png', 137, 37);
    this.game.load.spritesheet('level05', 'assets/level05.png', 137, 37);
    this.game.load.spritesheet('level06', 'assets/level06.png', 137, 37);
    this.game.load.spritesheet('level07', 'assets/level07.png', 137, 37);
    this.game.load.spritesheet('level08', 'assets/level08.png', 137, 37);
    this.game.load.spritesheet('level09', 'assets/level09.png', 137, 37);

    // Cargamos la música
    this.game.load.audio('menuMusic', 'assets/sound/menu.mp3');
    this.game.load.audio('music', 'assets/sound/tetris.mp3');
  },

  create: function () {
    this.game.state.start('menu');
  }
};