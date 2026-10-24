// Elements the browser already reaches by Tab and presses by Enter and Space
const isNativelyPressable = ({ tagName, type, href }) =>
	tagName === 'BUTTON' ||
	tagName === 'SUMMARY' ||
	(tagName === 'A' && !!href) ||
	(tagName === 'INPUT' && ['button', 'submit', 'reset', 'checkbox', 'radio'].includes(type));

const isDisabled = elem => elem.disabled === true || elem.getAttribute('aria-disabled') === 'true';

/**
 * Makes an element press like a button from the keyboard: reached by Tab, Enter presses as it goes down and Space as it
 * comes up (so a held key presses once, and Space doesn't scroll the page), each as a click, so whatever hears the
 * element's clicks (`onPointerPress`) hears the keyboard too. Only a key pressed on the element itself counts, not one
 * in a field inside it. A button, link or summary is left alone: it does all this already.
 * @param {HTMLElement} elem - The element
 * @param {object} [options] - Options
 * @param {string|false} [options.role] - The role it is given when it has none, button unless said; false gives none
 * @param {AbortSignal} [options.signal] - Ends the keyboard handling
 * @returns {Function} Undoes it: the listeners, and the role and tabindex it was given
 */
export const pressable = (elem, { role = 'button', signal } = {}) => {
	if (!elem || isNativelyPressable(elem)) return () => {};

	const added = [];

	if (role && !elem.hasAttribute('role')) {
		elem.setAttribute('role', role);
		added.push('role');
	}

	if (!elem.hasAttribute('tabindex')) {
		elem.tabIndex = 0;
		added.push('tabindex');
	}

	let spaceHeld = false;
	const controller = new AbortController();
	const listen = { signal: controller.signal };

	signal?.addEventListener('abort', () => controller.abort(), { once: true });
	const ownKey = event =>
		event.target === elem && !event.altKey && !event.ctrlKey && !event.metaKey && !isDisabled(elem);

	elem.addEventListener(
		'keydown',
		event => {
			if (!ownKey(event)) return;

			if (event.key === 'Enter') {
				event.preventDefault();
				if (!event.repeat) elem.click();
			} else if (event.key === ' ') {
				event.preventDefault();
				spaceHeld = true;
			}
		},
		listen,
	);

	elem.addEventListener(
		'keyup',
		event => {
			if (event.key !== ' ' || !spaceHeld) return;

			spaceHeld = false;

			if (ownKey(event)) elem.click();
		},
		listen,
	);

	elem.addEventListener('blur', () => (spaceHeld = false), listen);

	return () => {
		controller.abort();
		for (const attribute of added) elem.removeAttribute(attribute);
	};
};
