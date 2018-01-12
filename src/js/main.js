'use strict';

// Creación del juego y los estados
window.onload = function () {
  var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'game'); // The Game; you loose

  game.state.add('boot', BootScene);  // Carga de assets para la pantalla de carga
  game.state.add('preloader', PreloaderScene);  // Carga de assets para el juego
  game.state.add('menu', MenuScene);  // Pantalla de menú principal
  game.state.add('game', GameScene);  // La escena de juego principal
  game.state.add('gameover', GameoverScene);  // El final del juego

  game.state.start('boot');
};

var BootScene = {
  preload: function () {
    this.game.load.image('preloader_bar', 'assets/preloader_bar.png');
  },

  create: function () {
    this.game.state.start('preloader');
    console.log("Boot State success!");
  }
};

var PreloaderScene = {
  preload: function () {
    //this.game.load.baseURL = 'https://nestorcabrero.github.io/TetrisPVLI/src/';
    this.game.load.crossOrigin = 'anonymous';

    this.loadingBar = this.game.add.sprite(0, 240, 'preloader_bar');
    this.loadingBar.anchor.setTo(0, 0.5);
    this.load.setPreloadSprite(this.loadingBar);

    this.game.load.bitmapFont('gameover', 'assets/fonts/gameover.png', 'assets/fonts/gameover.fnt');
    this.game.load.bitmapFont('videogame', 'assets/fonts/videogame.png', 'assets/fonts/videogame.fnt');
    this.game.load.bitmapFont('desyrel', 'assets/fonts/desyrel.png', 'assets/fonts/desyrel.xml');
    this.game.load.image('background', 'assets/starfield.png')
    this.game.load.spritesheet('button', 'assets/p1.png', 137, 37);    
    this.game.load.spritesheet('button2', 'assets/p2.png', 137, 37);    
    this.game.load.audio('menuMusic', 'assets/sound/menu.mp3');
    this.game.load.audio('music', 'assets/sound/tetris.mp3');
    console.log("Asset load success!");
  },

  create: function () {
    this.game.state.start('menu');
    console.log("Preload State success!");
  }
};