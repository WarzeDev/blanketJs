class Sound {
	/**
	 * @param {string} soundName Display name
	 * @param {object} [options]
	 * @param {{id: string, blob: Blob}} [options.custom] Set for user-added sounds
	 * @param {(sound: Sound) => void} [options.onRemove] Called when the remove button of a custom sound is clicked
	 */
	constructor(soundName, { custom = null, onRemove = null } = {}) {
		const fileName = custom ? `custom-${custom.id}` : soundName.toLowerCase().replace(/ /g, '');

		this.customId = custom ? custom.id : null;
		this.objectUrl = null;
		this.key = `blanket-${fileName}-volume`;

		this.element = document.createElement('div');
		this.element.classList.add('sound');
		this.element.dataset.sound = fileName;

		if (custom) {
			this.element.classList.add('custom');
			this.objectUrl = URL.createObjectURL(custom.blob);
			this.sound = new Audio(this.objectUrl);
		} else {
			this.sound = new Audio(`assets/sounds/${fileName}.ogg`);
		}
		this.sound.preload = 'auto';
		this.sound.load();
		this.sound.loop = true;

		this.sound.volume = this.getVolume();

		this.iconContainer = document.createElement('div');
		this.iconContainer.classList.add('iconContainer');

		this.icon = new Image();
		this.icon.classList.add('icon');
		this.icon.src = `assets/icons/${custom ? 'noise' : fileName}.svg`;
		this.iconContainer.appendChild(this.icon);

		this.text = document.createElement('p');
		this.text.classList.add('name');
		this.text.textContent = soundName;
		this.text.title = soundName;

		this.sliderContainer = document.createElement('div');
		this.sliderContainer.classList.add('volumeContainer');

		this.slider = document.createElement('div');
		this.slider.classList.add('volume');
		this.slider.style.setProperty('--width', `${this.sound.volume * 100}%`);
		this.sliderContainer.appendChild(this.slider);

		// Append elements to the container
		this.element.appendChild(this.iconContainer);
		this.element.appendChild(this.text);
		this.element.appendChild(this.sliderContainer);

		// Remove button (custom sounds only)
		if (custom) {
			this.removeButton = document.createElement('button');
			this.removeButton.type = 'button';
			this.removeButton.classList.add('removeSound');
			this.removeButton.title = `Remove ${soundName}`;
			this.removeButton.setAttribute('aria-label', `Remove ${soundName}`);
			this.removeButton.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
			this.removeButton.addEventListener('click', (event) => {
				event.stopPropagation();
				if (onRemove) onRemove(this);
			});
			this.element.appendChild(this.removeButton);
		}

		// Slider events
		this.sliderContainer.addEventListener('mousedown', (event) => {
			this.updateSlider.call(this, event);
		});
		this.sliderContainer.addEventListener('touchstart', (event) => {
			this.updateSlider.call(this, event.touches[0]);
		});
		this.sliderContainer.addEventListener('mousemove', (event) => {
			if (event.buttons === 1) {
				this.updateSlider.call(this, event);
			}
		});
		this.sliderContainer.addEventListener('touchmove', (event) => {
			this.updateSlider.call(this, event.touches[0]);
		});

		// Icon events
		this.iconContainer.addEventListener('click', this.toggle.bind(this));
	}
	updateSlider(event) {
		const rect = this.sliderContainer.getBoundingClientRect();
		let volume = (event.clientX - rect.left) / rect.width;
		volume = Math.max(0, Math.min(1, volume));
		if (volume === 0) {
			this.stop();
		} else {
			this.play();
		}
		this.setVolume(volume);
		this.slider.style.setProperty('--width', `${volume * 100}%`);
	}
	getVolume() {
		return localStorage.getItem(this.key) || 0.5;
	}
	setVolume(volume) {
		this.sound.volume = volume;
		localStorage.setItem(this.key, volume);
	}
	play() {
		this.sound.play();
		this.element.classList.remove('paused');
		this.element.classList.add('active');
	}
	stop() {
		this.sound.pause();
		this.element.classList.remove('active');
	}
	toggle() {
		if (this.sound.paused) {
			this.play();
		} else {
			this.stop();
		}
	}
	pause() {
		if (this.sound.paused) return;
		this.stop();
		this.element.classList.add('paused');
	}
	unpause() {
		if (this.element.classList.contains('paused')) {
			this.play();
			this.element.classList.remove('paused');
		}
	}
	// Fully removes a sound: stops playback, frees the file and forgets its volume
	destroy() {
		this.sound.pause();
		this.sound.removeAttribute('src');
		this.sound.load();
		if (this.objectUrl) {
			URL.revokeObjectURL(this.objectUrl);
			this.objectUrl = null;
		}
		localStorage.removeItem(this.key);
		this.element.remove();
	}
}