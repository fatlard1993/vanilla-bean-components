import process from 'process';
import { Page } from '..';

import DemoMenu from './DemoMenu';
import DemoRouter from './DemoRouter';

window.process = process;

const menu = new DemoMenu();

new Page({
	appendTo: document.getElementById('app'),
	append: [menu, new DemoRouter({ onRenderView: route => menu.updateSelection(route) })],
});

const socket = new WebSocket(`ws://${window.location.host}/ws`);

socket.addEventListener('message', event => {
	if (event.data === 'hotReload') window.location.reload();
});

socket.addEventListener('error', error => {
	console.error('WS Error:', error);

	socket.close();
});
