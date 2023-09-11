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
