// Custom sounds: "Add sound" tile, dialog and restoring saved sounds on startup.
// Relies on Sound, CustomSoundStore, soundList and soundContainer.
(() => {
	const MAX_NAME_LENGTH = 24;
	const PROBE_TIMEOUT_MS = 8000;

	const dialog = document.getElementById('addSoundDialog');
	const form = document.getElementById('addSoundForm');
	const fileInput = document.getElementById('addSoundFile');
	const nameInput = document.getElementById('addSoundName');
	const errorText = document.getElementById('addSoundError');
	const cancelButton = document.getElementById('addSoundCancel');
	const submitButton = document.getElementById('addSoundSubmit');

	// "Add sound" tile at the end of the grid
	const addTile = document.createElement('button');
	addTile.type = 'button';
	addTile.classList.add('sound', 'addSound');
	addTile.innerHTML = `
		<div class="iconContainer">
			<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
		</div>
		<p class="name">Add sound</p>
	`;
	soundContainer.appendChild(addTile);
	addTile.addEventListener('click', openDialog);

	// Sounds
	function createId() {
		if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
		return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
	}

	function addCustomSound(record, reveal = false) {
		const sound = new Sound(record.name, {
			custom: { id: record.id, blob: record.blob },
			onRemove: removeCustomSound,
		});
		soundContainer.insertBefore(sound.element, addTile);
		soundList.push(sound);
		if (reveal) {
			sound.element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}

	async function removeCustomSound(sound) {
		const name = sound.text.textContent;
		if (!confirm(`Remove "${name}"? The audio file will be deleted from this browser.`)) return;

		try {
			await CustomSoundStore.remove(sound.customId);
		} catch (error) {
			console.error('Could not remove custom sound:', error);
			alert('Could not remove this sound. Please try again.');
			return;
		}

		const index = soundList.indexOf(sound);
		if (index !== -1) soundList.splice(index, 1);
		sound.destroy();
	}

	// Checks that the browser can actually decode the file before saving it
	function probeAudio(file) {
		return new Promise((resolve, reject) => {
			const url = URL.createObjectURL(file);
			const probe = new Audio();
			let timer;

			const finish = (error) => {
				clearTimeout(timer);
				probe.removeAttribute('src');
				URL.revokeObjectURL(url);
				if (error) reject(error);
				else resolve();
			};

			probe.preload = 'metadata';
			probe.addEventListener('loadedmetadata', () => finish(), { once: true });
			probe.addEventListener('error', () => finish(new Error('This file could not be read as audio.')), { once: true });
			timer = setTimeout(() => finish(new Error('Reading this file took too long. Try a different one.')), PROBE_TIMEOUT_MS);
			probe.src = url;
		});
	}

	// Dialog
	function showError(message) {
		errorText.textContent = message;
	}

	function setBusy(busy) {
		submitButton.disabled = busy;
		submitButton.textContent = busy ? 'Adding…' : 'Add sound';
	}

	function openDialog() {
		form.reset();
		delete nameInput.dataset.touched;
		showError('');
		setBusy(false);
		dialog.showModal();
	}

	nameInput.addEventListener('input', () => {
		nameInput.dataset.touched = 'true';
	});

	// Suggest a name from the file name until the user types their own
	fileInput.addEventListener('change', () => {
		showError('');
		const file = fileInput.files[0];
		if (!file || nameInput.dataset.touched) return;
		nameInput.value = file.name
			.replace(/\.[^.]+$/, '')
			.replace(/[_-]+/g, ' ')
			.trim()
			.slice(0, MAX_NAME_LENGTH);
	});

	cancelButton.addEventListener('click', () => dialog.close());

	// Click on the backdrop closes the dialog
	dialog.addEventListener('mousedown', (event) => {
		if (event.target === dialog) dialog.close();
	});

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const file = fileInput.files[0];
		const name = nameInput.value.trim();
		if (!file) {
			showError('Choose an audio file.');
			return;
		}
		if (!name) {
			showError('Give your sound a name.');
			nameInput.focus();
			return;
		}

		setBusy(true);
		showError('');
		try {
			await probeAudio(file);
			const record = {
				id: createId(),
				name: name.slice(0, MAX_NAME_LENGTH),
				blob: file,
				added: Date.now(),
			};
			await CustomSoundStore.add(record);
			addCustomSound(record, true);
			dialog.close();
		} catch (error) {
			console.error('Could not add custom sound:', error);
			showError(error.message || 'Could not add this sound.');
		} finally {
			setBusy(false);
		}
	});

	// Restore saved sounds
	CustomSoundStore.getAll()
		.then((records) => records.forEach((record) => addCustomSound(record)))
		.catch((error) => console.warn('Custom sounds are unavailable:', error));
})();