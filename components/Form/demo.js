import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { ColorPicker } from '../ColorPicker';
import { Button } from '../Button';
import { Form } from '.';

export default class Demo extends DemoView {
	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Form({
			data: { name: 'myName', url: 'myUrl', color: 'red' },
			inputs: [
				{ key: 'name', validations: [[/.+/, 'Required']] },
				{ key: 'url', validations: [[/.+/, 'Required']] },
				{ key: 'color', Component: ColorPicker },
			],
			appendTo: this.demoWrapper,
		});

		new Button({
			content: 'Submit',
			appendTo: this.demoWrapper,
			onPointerPress: () => {
				if (component.validate()) return console.log('form is invalid');

				console.log('form is valid', component.options.data);
			},
		});

		super.render({ ...options, component });
	}
}