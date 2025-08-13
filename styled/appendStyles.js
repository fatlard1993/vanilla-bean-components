/**
 * Inject CSS directly into the document head via a style element
 * @param {string} css - Raw CSS string to inject
 * @param {string} [id] - Optional element ID for the created style tag (enables later removal/updates)
 * @returns {HTMLStyleElement} The created and appended style element
 */
export const appendStyles = (css, id) => {
	const style = document.createElement('style');

	style.innerHTML = css;
	if (id) style.id = id;

	document.head.append(style);

	return style;
};
