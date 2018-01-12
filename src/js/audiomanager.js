'use strict';

class AudioManager {

	constructor() {
		this.soundOn = true;
		this.moveSound = null;
		this.clickSound = null;
		this.levelSound = null;
		this.winSound = null;
		this.gameoverSound = null;
		this.music = null;
	}	

	playMusic() {
		if(this.soundOn && !pause) {
			this.music.resume();
		}
	}

	playSound(sound) {
		if(this.soundOn && !pause) {
			sound.play();
		}
	}

	toggleSound(sprite) {
        sprite.frame = 1 - sprite.frame;
        this.soundOn = !this.soundOn;

        if(this.soundOn) this.playMusic();
        else this.music.pause();
    }
};