import './index.css';

import dom from '../../utils/dom';

import DomElem from '../DomElem';

export class Page extends DomElem {
	constructor(options) {
		super({ autoRender: false, ...options });

		if (document.readyState !== 'loading') this.onLoad();
		else document.addEventListener('DOMContentLoaded', this.onLoad);
	}

	onLoad() {
		if (this.options.mobileSupport !== false) dom.mobile.detect();

		this.render();
	}
}

export default Page;
