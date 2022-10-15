import './index.css';

import dom from '../../utils/dom';

import DomElem from '../DomElem';

export class Page {
	constructor(options) {
		dom.onLoad(() => {
			dom.mobile.detect();

			this.render(options);
		});
	}

	render({ className, ...rest } = {}) {
		this.cleanup();

		this.elem = new DomElem('div', { className: ['page', className], ...rest });
	}

	cleanup() {
		if (this.elem) dom.remove(this.elem);
	}
}

export default Page;
