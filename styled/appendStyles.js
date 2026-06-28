/**
 * Inject CSS directly into the document head via a style element
 * @param {string} css - Raw CSS string to inject
 * @param {string} [id] - Optional element ID for the created style tag (enables later removal/updates)
 * @returns {HTMLStyleElement | undefined} The created or updated style element, or undefined if no CSS provided
 */
export const appendStyles = (css, id) => {
	if (!css) return undefined;
	if (id) {
		const existing = document.getElementById(id);

		if (existing) {
			existing.textContent = css;
			return existing;
		}
	}

	const style = document.createElement('style');

	style.textContent = css;
	if (id) style.id = id;

	document.head.append(style);

	return style;
};
