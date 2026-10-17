import '../app/reloadOnBuild';
import { Elem, Page, Router, View } from '..';

import DemoMenu from './DemoMenu';
import views from './views';

class NotFound extends View {
	build() {
		new Elem({
			style: {
				margin: '6px auto',
				padding: '6px 12px',
				textAlign: 'center',
			},
			textContent: `Could not find route "${this.options.route}"`,
			appendTo: this,
		});
	}
}

new Page({
	appendTo: document.body,
	append: [new DemoMenu(), new Router({ views, notFound: NotFound, defaultPath: '/documentation/demo' })],
	styleSheets: ['emoji-js/lib/emoji.css'],
});
