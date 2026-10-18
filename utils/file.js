/**
 * Whether a file is one an accept list allows, as an `<input type="file" accept>` reads it: extensions (.csv),
 * exact types (application/json) and type families (image/*). An empty list allows anything.
 * @param {File} file - The file
 * @param {string} [accept] - The accept list, comma separated
 * @returns {boolean} Whether it is allowed
 */
export const fileAccepted = (file, accept) => {
	const allowed = (accept ?? '')
		.split(',')
		.map(entry => entry.trim().toLowerCase())
		.filter(Boolean);

	if (!allowed.length) return true;

	const name = (file?.name ?? '').toLowerCase();
	const type = (file?.type ?? '').toLowerCase();

	return allowed.some(entry => {
		if (entry.startsWith('.')) return name.endsWith(entry);
		if (entry.endsWith('/*')) return type.startsWith(entry.slice(0, -1));

		return type === entry;
	});
};

/**
 * Read a file's contents.
 * @param {File|Blob} file - The file
 * @param {'text'|'json'|'dataURL'|'arrayBuffer'} [as] - What to read it as
 * @returns {Promise<string|object|ArrayBuffer>} Its contents
 */
export const readFile = (file, as = 'text') => {
	if (as === 'text') return file.text();
	if (as === 'json') return file.text().then(JSON.parse);
	if (as === 'arrayBuffer') return file.arrayBuffer();
	if (as !== 'dataURL') return Promise.reject(new TypeError(`readFile can't read as ${as}`));

	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.addEventListener('load', () => resolve(reader.result));
		reader.addEventListener('error', () => reject(reader.error));
		reader.readAsDataURL(file);
	});
};
