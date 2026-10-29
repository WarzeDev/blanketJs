let playingSounds = new Set();

// Add and remove sounds
function addPlayingSound(sound) {
	playingSounds.add(sound);
	saveCurrentSounds();
}

function removePlayingSound(sound) {
	playingSounds.delete(sound);
	saveCurrentSounds();
}

// Save management
let currentSaveName = 'Default';
function getCurrentSaveKey() {
	return 'blanket-save-' + currentSaveName;
}

function setNewSaveName(newSaveName) {
	currentSaveName = newSaveName;
	loadCurrentSounds();
}

// Save and load current sounds
function saveCurrentSounds() {
	localStorage.setItem(getCurrentSaveKey(), Array.from(playingSounds).join(','));
}

function loadCurrentSounds() {
	const names = localStorage.getItem(getCurrentSaveKey());
	if (names !== null) {
		let listHasPausedSounds = false;
		names.split(',').forEach((name) => {
			const sound = soundList.find((sound) => sound.name === name);
			if (sound) {
				sound.element.classList.add('paused');
				listHasPausedSounds = true;
			}
		});
		if (listHasPausedSounds) {
			playbackButton.classList.remove('active');
		}
	}
}

loadCurrentSounds();
