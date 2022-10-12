import router from './router';

import dom from '../utils/dom';

dom.onLoad(() => {
	dom.mobile.detect();

	router.renderView();
});
