import Router from './Router';

import dom from '../utils/dom';

dom.onLoad(() => {
	dom.mobile.detect();

	new Router({ appendTo: document.getElementById('app') });
});
