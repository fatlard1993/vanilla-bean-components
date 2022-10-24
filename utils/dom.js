export const dom = {
	isIOS: () => navigator.platform && /iP(hone|ad)/.test(navigator.platform),
	isSafari: () => navigator.vendor === 'Apple Computer, Inc.' && !navigator.userAgent.match('CriOS'),
	isNodeList: nodes => {
		const nodeCount = nodes?.length;
		const nodesString = Object.prototype.toString.call(nodes);
		const stringRegex = /^\[object (HTMLCollection|NodeList|Object)\]$/;

		return (
			typeof nodes === 'object' &&
			typeof nodeCount === 'number' &&
			stringRegex.test(nodesString) &&
			(nodeCount === 0 || (typeof nodes[0] === 'object' && nodes[0].nodeType > 0))
		);
	},
	findAncestor: (elem, class_id) => {
		while (
			(elem = elem.parentElement) &&
			(class_id[0] === '#' ? '#' + elem.id !== class_id : !elem.className.includes(class_id))
		);

		return elem;
	},
	empty: elem_s => {
		if (dom.isNodeList(elem_s)) return [].slice.call(elem_s).forEach(elem => dom.empty(elem));

		if (!elem_s || !elem_s.lastChild) return;

		while (elem_s.lastChild) elem_s.removeChild(elem_s.lastChild);
	},
	getElemIndex: (elem, index) => {
		if (typeof index === 'undefined') index = 0;

		if (elem.previousElementSibling) return dom.getElemIndex(elem.previousElementSibling, ++index);

		return index;
	},
	remove: elem_s => {
		if (dom.isNodeList(elem_s)) elem_s = [].slice.call(elem_s);

		elem_s?.parentElement?.removeChild(elem_s);
	},
	isDescendantOf: (elem, parent) => {
		const isTheParent = elem.parentElement === parent;

		return !isTheParent && elem.parentElement.parentElement
			? dom.isDescendantOf(elem.parentElement.parentElement, parent)
			: isTheParent;
	},
	getPixelDensity: () => {
		const reqTime = performance.now();

		if (dom.pixelDensity && dom.lastPixelDensityRefresh && reqTime - dom.lastPixelDensityRefresh < 5e3)
			return dom.pixelDensity;

		dom.lastPixelDensityRefresh = reqTime;

		return (dom.pixelDensity = window.devicePixelRatio || 1);
	},
	validate: (elem, force) => {
		if (!elem) return;

		let x, count;

		if (elem instanceof Array) {
			for (x = 0, count = elem.length; x < count; ++x) dom.validate(elem[x], force);

			return;
		}

		if (force || elem.validation) elem.classList.remove('validated', 'invalid');

		let valid,
			validationWarning = '';

		if (force) valid = 'validated';
		else if (elem.validation) {
			if (elem.validation instanceof Array) {
				for (x = 0, count = elem.validation.length; x < count; ++x) {
					if (valid !== 'invalid') {
						valid = dom.checkValid(elem.value, elem.validation[x]);

						if (elem.validationWarning[x] && valid === 'invalid')
							validationWarning += (validationWarning.length ? '\n' : '') + elem.validationWarning[x];
					}
				}
			} else {
				valid = dom.checkValid(elem.value, elem.validation);

				if (elem.validationWarning && valid === 'invalid') validationWarning = elem.validationWarning;
			}
		}

		elem.classList.add(valid);

		if (valid === 'validated') dom.showValidationWarnings(elem.parentElement);

		return validationWarning;
	},
	checkValid: (string, regex) => {
		return new RegExp(regex).test(string) ? 'validated' : 'invalid';
	},
	showValidationWarnings: parentElement => {
		if (!parentElement) return;

		const invalidElements = parentElement.getElementsByClassName('invalid');

		dom.remove(parentElement.getElementsByClassName('validationWarning'));

		if (!invalidElements || !invalidElements.length) return;

		let showingWarnings = false;

		for (let x = 0; x < invalidElements.length; ++x) {
			const validationWarning = dom.validate(invalidElements[x]);

			if (validationWarning) {
				showingWarnings = true;

				invalidElements[x].parentElement.insertBefore(
					dom.createElem('p', { className: 'validationWarning', textContent: validationWarning }),
					invalidElements[x],
				);
			}
		}

		if (!showingWarnings)
			dom.createElem('p', {
				className: 'validationWarning',
				textContent: 'There are fields which require your attention!',
				prependTo: parentElement,
			});

		return showingWarnings;
	},
	getScreenOrientation: () => {
		let orientation = 'primary';

		if (window.screen && window.screen.orientation && window.screen.orientation.type)
			orientation = window.screen.orientation.type;
		else if (typeof window.orientation !== 'undefined')
			orientation = Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';

		return orientation;
	},
	isMobile: false,
	mobile: {
		detect: evt => {
			if (!evt) {
				if (!dom.mobile.detectionEnabled) {
					dom.mobile.detectionEnabled = true;

					document.addEventListener('touchstart', dom.mobile.detect);
					document.addEventListener('mousedown', dom.mobile.detect);
					document.addEventListener('touchend', dom.mobile.detect);
					document.addEventListener('touchcancel', dom.mobile.detect);
					document.addEventListener('mouseup', dom.mobile.detect);
				}

				return;
			}

			const isTouch = evt.type.startsWith('touch');

			if (!isTouch && dom.mobile.lastTouchTime && performance.now() - dom.mobile.lastTouchTime < 350) return;
			else if (isTouch) dom.mobile.lastTouchTime = performance.now();

			dom.mobile[`${isTouch ? 'en' : 'dis'}able`]();
		},
		enable: () => {
			if (dom.isMobile) return;

			document.body.classList.add('mobile');

			dom.isMobile = true;
		},
		disable: () => {
			if (dom.isMobile === false) return;

			document.body.classList.remove('mobile');

			dom.isMobile = false;
		},
	},
};

export default dom;
