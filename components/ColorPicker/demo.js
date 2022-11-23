import { DomElem, ColorPicker, Label, TextInput, Button } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		const label = 'label';

		const colorPicker = new ColorPicker({
			label,
			value: 'random',
			onChange: console.log,
			appendTo: this.demoWrapper,
			appendChildren: [new Button({ textContent: 'Random', onPointerPress: () => colorPicker.set('random') })],
		});

		const appendTo = this.demoContent;

		new Label({
			label: 'label',
			appendTo,
			appendChild: new TextInput({
				value: label,
				onKeyUp: ({ target: { value } }) => (colorPicker.label.elem.children[0].textContent = value),
			}),
		});

		new Label({
			label: 'onChange: console.log',
			appendTo,
		});

		new Label({
			label: 'Props',
			appendTo,
			appendChildren: [
				new DomElem({ tag: 'pre', textContent: '- value [string] (optional) :: "#666"' }),
				new DomElem({ tag: 'pre', textContent: '- onChange [function] (optional) :: () => {}' }),
				new DomElem({ tag: 'pre', textContent: '- label [string] (optional)' }),
				new DomElem({ tag: 'pre', textContent: '- ...rest => DomElem' }),
			],
		});
	}
}
