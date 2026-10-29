const soundNameList = [
	'Rain',
	'Storm',
	'Wind',
	'Waves',
	'Stream',
	'Birds',
	'Summer Night',
	'Train',
	'Boat',
	'City',
	'Coffee Shop',
	'Fireplace',
	'Pink Noise',
	'White Noise',
];

const soundList = [];

const soundContainer = document.getElementById('soundList');

soundNameList.forEach((soundName) => {
	const sound = new Sound(soundName);	
	soundContainer.appendChild(sound.element);
	soundList.push(sound);
});

const playbackButton = document.getElementById('playback');

playbackButton.addEventListener('click', clickPlayback);
window.addEventListener('keydown', (event) => {
	if (event.key !== ' ') return;
	// Don't hijack the space bar while typing (e.g. in the add sound dialog),
	// or twice on the playback button which already handles it natively
	if (event.target.closest('input, textarea, select, dialog, #playback')) return;
	clickPlayback();
});

function clickPlayback() {
	if (playbackButton.classList.contains('active')) {
		soundList.forEach((sound) => {
			sound.pause();
		});
	} else {
		soundList.forEach((sound) => {
			sound.unpause();
		});
	}
	playbackButton.classList.toggle('active');
}