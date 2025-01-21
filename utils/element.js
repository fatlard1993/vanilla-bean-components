/**
 * Return the index of a target element within its parent
 * @param {HTMLElement} element - The target element
 * @param {number} index - (do not use)
 * @returns {number} index
 */
export const getElementIndex = (element, index = 0) => {
	if (index === undefined) index = 0;

	if (element.previousElementSibling) return getElementIndex(element.previousElementSibling, ++index);

	return index;
};

/**
 * Check if one element is a descendant of another element
 * @param {HTMLElement} element - The target element
 * @param {HTMLElement} parentElement - The potential targets ancestor
 * @returns {boolean} element isDescendantOf parent
 */
export const isDescendantOf = (element, parentElement) => {
	const isTheParent = element.parentElement === parentElement;

	return !isTheParent && element.parentElement?.parentElement
		? isDescendantOf(element.parentElement.parentElement, parentElement)
		: isTheParent;
};
