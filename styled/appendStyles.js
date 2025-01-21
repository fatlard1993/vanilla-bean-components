/**
 * Append a style tag with custom css onto the page at runtime
 * @param {string} css - The css string to inject into the page
 * @param {string} [id] - An optional id to attach to the style tag
 * @returns {HTMLStyleElement} The created style tag
 */
export const appendStyles = (css, id) => {
	const style = document.createElement('style');

	style.innerHTML = css;
	if (id) style.id = id;

	document.head.append(style);

	return style;
};
