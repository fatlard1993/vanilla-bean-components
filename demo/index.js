import router from './router';

import dom from 'dom';

dom.onLoad(() => {
	dom.mobile.detect();

	router.renderView();
});
