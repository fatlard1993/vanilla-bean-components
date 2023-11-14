/**
 * Append a style tag with custom css onto the page at runtime
 * @param {String} css - The css string to inject into the page
 */
export const appendStyles = css => {
	const style = document.createElement('style');

	style.innerHTML = css;

	document.head.append(style);
};
