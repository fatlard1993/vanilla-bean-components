import DemoView from '../../demo/DemoView';
import { GET } from '../../request';
import { randInt } from '../../utils';
import { Component } from '../../Component';
import { Button } from '../Button';
import { Dialog } from '.';

export default class Demo extends DemoView {
	async render() {
		const baconIpsum = await GET('/api-pass', {
			searchParameters: { api: `https://baconipsum.com/api/?type=all-meat&sentences=${randInt(3, 33)}` },
		});

		this.component = new Dialog({
			header: 'header',
			size: 'small',
			variant: null,
			body: [
				new Component({
					style: { color: 'green' },
					textContent: 'body',
				}),
				...baconIpsum.body,
			],
			buttons: ['noop', 'dismiss'],
			openOnRender: false,
			onButtonPress: ({ button, closeDialog }) => {
				console.log({ button, closeDialog });

				closeDialog();
			},
		});

		super.render();

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Open',
			onPointerPress: () => this.component.open(),
		});
	}
}
