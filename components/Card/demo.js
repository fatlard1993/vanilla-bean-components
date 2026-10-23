import DemoView from '../../demo/DemoView';
import { Component } from '../../Component';
import { Notify } from '../Notify';
import theme from '../../theme';
import { Card } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Card(
			{ accent: theme.colors.green, onPointerPress: () => new Notify({ content: 'Opened North 80' }) },
			new Component({ textContent: 'North 80' }),
			new Component({
				textContent: '80 ac · owned',
				style: { color: theme.colors.muted, fontSize: theme.fontSize.sm },
			}),
		);

		new Card(
			{ appendTo: this.demoWrapper, style: { marginTop: '8px' } },
			'A card with nothing to do but hold this line.',
		);
	}
}
