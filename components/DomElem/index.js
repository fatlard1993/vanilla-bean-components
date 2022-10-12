import dom from '../../utils/dom';

import state from '../state';

import { buildClassName } from '../../utils/class';

export default class DomElem {
	constructor(nodeName, options) {
		this.nodeName = nodeName;
		this.options = options || {};

		this.render(nodeName, this.options);

		return this.elem;
	}

	render(nodeName, { className, onPointerPress, ...rest }) {
		this.cleanup();

		this.elem = dom.createElem(nodeName, {
			...(className ? { className: buildClassName(className) } : {}),
			onPointerPress: evt => {
				if (state.disablePointerPress) {
					state.disablePointerPress = false;

					return;
				}

				if (typeof onPointerPress === 'function') onPointerPress(evt);
			},
			...rest,
		});
	}

	cleanup() {
		if (this) dom.remove(this);
	}

	appendChildren(children) {
		dom.appendChildren(this, children);
	}

	appendChild(child) {
		dom.appendChild(this, child);
	}

	prependChild(child) {
		dom.prependChild(this, child);
	}
}
