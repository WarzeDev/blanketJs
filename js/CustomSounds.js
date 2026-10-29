// Stores user-added sounds in IndexedDB (audio files are too large for localStorage).
const CustomSoundStore = (() => {
	const DB_NAME = 'blanket';
	const STORE_NAME = 'custom-sounds';
	let dbPromise = null;

	function open() {
		if (dbPromise) return dbPromise;

		dbPromise = new Promise((resolve, reject) => {
			if (!('indexedDB' in window)) {
				reject(new Error('Your browser does not support saving custom sounds.'));
				return;
			}
			const request = indexedDB.open(DB_NAME, 1);
			request.onupgradeneeded = () => {
				request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
			};
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});

		// Allow a retry on the next call if opening failed
		dbPromise.catch(() => { dbPromise = null; });

		return dbPromise;
	}

	function run(mode, work) {
		return open().then((db) => new Promise((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, mode);
			const request = work(transaction.objectStore(STORE_NAME));
			let result;
			request.onsuccess = () => { result = request.result; };
			transaction.oncomplete = () => resolve(result);
			transaction.onerror = () => reject(transaction.error);
			transaction.onabort = () => reject(transaction.error);
		}));
	}

	return {
		async getAll() {
			const records = await run('readonly', (store) => store.getAll());
			return records.sort((a, b) => a.added - b.added);
		},
		async add(record) {
			// Ask the browser not to evict the saved sounds under storage pressure
			if (navigator.storage && navigator.storage.persist) {
				navigator.storage.persist().catch(() => {});
			}
			try {
				await run('readwrite', (store) => store.put(record));
			} catch (error) {
				if (error && error.name === 'QuotaExceededError') {
					throw new Error('Not enough browser storage left for this file.');
				}
				throw error;
			}
		},
		remove(id) {
			return run('readwrite', (store) => store.delete(id));
		},
	};
})();