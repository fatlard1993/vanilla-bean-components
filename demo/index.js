import process from 'process';
import { Elem, Page, Router, View } from '..';

import DemoMenu from './DemoMenu';
import views from './views';

window.process = process;

const menu = new DemoMenu();

class NotFound extends View {
	render() {
		new Elem({
			style: {
				margin: '6px auto',
				padding: '6px 12px',
				textAlign: 'center',
			},
			textContent: `Could not find route "${this.options.route}"`,
			appendTo: this,
		});

		super.render();
	}
}

new Page({
	appendTo: document.body,
	append: [menu, new Router({ views, notFound: NotFound, onRenderView: route => menu.updateSelection(route) })],
});

const socket = new WebSocket(`ws://${window.location.host}/ws`);

socket.addEventListener('message', event => {
	if (event.data === 'hotReload') window.location.reload();
});

socket.addEventListener('error', error => {
	console.error('WS Error:', error);

	socket.close();
});
