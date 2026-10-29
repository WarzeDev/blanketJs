const themes = [
	{ id: 'light', name: 'Light' },
	{ id: 'dark', name: 'Dark' },
	{ id: 'amoled', name: 'AMOLED' },
	{ id: 'candy', name: 'Candy' },
	{ id: 'warze', name: 'Warze' },
	{ id: 'greyscale', name: 'Greyscale' },
	{ id: 'mocha', name: 'Mocha' },
	{ id: 'intensity', name: 'Intensity' },
	{ id: 'daydream', name: 'Daydream' },
	{ id: 'catppuccin', name: 'Catppuccin' },
	{ id: 'catppuccin-latte', name: 'Catppuccin Latte' },
	{ id: 'dracula', name: 'Dracula' },
	{ id: 'nord', name: 'Nord' },
	{ id: 'gruvbox', name: 'Gruvbox' },
	{ id: 'tokyo-night', name: 'Tokyo Night' },
	{ id: 'rose-pine', name: 'Rosé Pine' },
];

const themeKey = 'blanket-theme';
const defaultTheme = 'dark';

const themeWrapper = document.getElementById('theme');
const themeToggle = document.getElementById('themeToggle');
const themeList = document.getElementById('themeList');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const themeButtons = new Map();

function getCurrentTheme() {
	const stored = localStorage.getItem(themeKey);
	return themes.some((theme) => theme.id === stored) ? stored : defaultTheme;
}

function applyTheme(themeId) {
	document.documentElement.setAttribute('data-theme', themeId);

	// Match the browser / installed app title bar to the theme
	if (themeColorMeta) {
		const background = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
		if (background) themeColorMeta.setAttribute('content', background);
	}

	themeButtons.forEach((button, id) => {
		button.setAttribute('aria-pressed', String(id === themeId));
	});
}

function setTheme(themeId) {
	localStorage.setItem(themeKey, themeId);
	applyTheme(themeId);
}

function nextTheme() {
	const index = themes.findIndex((theme) => theme.id === getCurrentTheme());
	setTheme(themes[(index + 1) % themes.length].id);
}

function setThemeListOpen(open) {
	themeList.classList.toggle('hidden', !open);
	themeToggle.setAttribute('aria-expanded', String(open));

	if (open) {
		// Center the active theme in the (scrollable) list
		const active = themeButtons.get(getCurrentTheme());
		themeList.scrollTop = active.offsetTop - (themeList.clientHeight - active.offsetHeight) / 2;
	}
}

themeToggle.addEventListener('click', () => {
	setThemeListOpen(themeList.classList.contains('hidden'));
});

document.addEventListener('click', (event) => {
	if (!themeWrapper.contains(event.target)) setThemeListOpen(false);
});

window.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') setThemeListOpen(false);
});

themes.forEach((theme) => {
	const button = document.createElement('button');
	button.type = 'button';

	// The preview circle reads its colors from the theme's own CSS variables
	const preview = document.createElement('span');
	preview.classList.add('themePreview');
	preview.dataset.theme = theme.id;
	preview.setAttribute('aria-hidden', 'true');

	const label = document.createElement('span');
	label.textContent = theme.name;

	button.append(preview, label);
	button.addEventListener('click', () => setTheme(theme.id));

	themeList.appendChild(button);
	themeButtons.set(theme.id, button);
});

applyTheme(getCurrentTheme());