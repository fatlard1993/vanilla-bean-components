import DemoView from '../../demo/DemoView';
import { Component } from '../../Component';
import { GET } from '../../request';
import { randInt } from '../../utils';
import { Button } from '../Button';
import { Dialog } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Dialog({
			header: 'header',
			size: 'small',
			variant: null,
			body: 'Loading…',
			buttons: ['noop', 'dismiss'],
			openOnRender: false,
			onButtonPress: ({ button, closeDialog }) => {
				console.log({ button, closeDialog });

				closeDialog();
			},
		});

		GET('/api-pass', {
			searchParameters: { api: `https://baconipsum.com/api/?type=all-meat&sentences=${randInt(3, 33)}` },
		}).then(baconIpsum => {
			this.component.options.body = [
				new Component({ style: { color: 'green' }, textContent: 'body' }),
				...baconIpsum.body,
			];
		});

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Open',
			onPointerPress: () => this.component.open(),
		});
	}
}
