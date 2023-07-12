import { isNodeList } from './dom';

/**
 * Remove all child elements from target element(s)
 */
export const empty = elem_s => {
	if (isNodeList(elem_s)) return Array.from(elem_s).forEach(elem => empty(elem));

	if (!elem_s || !elem_s.lastChild) return;

	while (elem_s.lastChild) elem_s.lastChild.remove();
};

/**
 * Remove target element(s)
 */
export const remove = elem_s => {
	if (isNodeList(elem_s)) elem_s = Array.from(elem_s);

	elem_s?.remove();
};

/**
 * Return the index of a target element within its parent
 * @return {Number} index
 */
export const getElemIndex = (elem, index) => {
	if (index === undefined) index = 0;

	if (elem.previousElementSibling) return getElemIndex(elem.previousElementSibling, ++index);

	return index;
};

/**
 * Check if the current device is a mac
 * @param {HTMLElement} element - The target element
 * @param {HTMLElement} parent - The potential targets ancestor
 * @return {Boolean} element isDescendantOf parent
 */
export const isDescendantOf = (elem, parent) => {
	const isTheParent = elem.parentElement === parent;

	return !isTheParent && elem.parentElement?.parentElement
		? isDescendantOf(elem.parentElement.parentElement, parent)
		: isTheParent;
};
