import { DomElem, Button, Select } from '../..';

import DemoView, { DemoWrapper } from '../DemoView';

import { Counter } from './Counter';
import { Calculator } from './Calculator';
import { Stopwatch } from './Stopwatch';

class MultiWidget extends DomElem {
	render() {
		super.render();

		const chooseWidget = new Select({
			appendTo: this,
			options: ['Counter', 'Calculator', 'Stopwatch'],
			style: { display: 'inline', width: '50%', marginRight: '18px' },
		});

		new Button({
			content: 'Add Widget',
			appendTo: this,
			onPointerPress: () => {
				const widget = new DomElem(
					{},
					new { Counter, Calculator, Stopwatch }[chooseWidget.value](),
					new Button({ content: '❌', onPointerPress: () => widget.elem.remove() }),
				);

				this.append(widget);
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
