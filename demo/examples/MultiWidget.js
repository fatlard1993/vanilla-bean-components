import { Component, Button, Select } from '../..';

import DemoView, { DemoWrapper } from '../DemoView';
import context from '../../components/context';

import { Counter } from './Counter';
import { Calculator } from './Calculator';
import { Stopwatch } from './Stopwatch';

class MultiWidget extends Component {
	render() {
		super.render();

		const chooseWidget = new Select({
			appendTo: this,
			value: '',
			options: [{ disabled: true, label: 'Add Widget', value: '' }, 'Counter', 'Calculator', 'Stopwatch'],
			onChange: ({ value }) => {
				const widget = new Component(
					{
						style: {
							position: 'relative',
							backgroundColor: context.component.theme.colors.white.setAlpha(0.06),
							margin: '12px',
							padding: '6px',
							minHeight: '38px',
						},
					},
					new { Counter, Calculator, Stopwatch }[value](),
					new Button({
						content: '❌',
						onPointerPress: () => widget.elem.remove(),
						style: { position: 'absolute', top: '6px', right: 0 },
					}),
				);

				this.append(widget);

				chooseWidget.options.value = '';
			},
		});
	}
}

export default class Example extends DemoView {
	render() {
		super.render();

		new DemoWrapper({ appendTo: this }, new MultiWidget());
	}
}
