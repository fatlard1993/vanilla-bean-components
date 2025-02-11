import DemoView from '../../demo/DemoView';
import { ColorPicker } from '../ColorPicker';
import { Button } from '../Button';
import { Select } from '../Select';
import { Form } from '.';

export default class Demo extends DemoView {
	render() {
		this.component = new Form(
			{
				data: { string: 'myString', number: 13, bool: true, color: 'blue', multiChoice: 'one' },
				inputs: [
					{ key: 'string', validations: [[/.+/, 'Required']] },
					{
						key: 'number',
						validations: [[_ => _ === 42, 'Must be the answer to Life, the Universe and Everything']],
						parse: value => Number.parseInt(value, 10),
					},
					{ key: 'bool' },
					{ key: 'color', InputComponent: ColorPicker, parse: (value, input) => input.parseValue(value).hslString },
					{ key: 'multiChoice', InputComponent: Select, options: ['one', 'two', 'three'] },
				],
			},
			new Button({
				content: 'Submit',
				appendTo: this.demoWrapper,
				onPointerPress: () => {
					if (this.component.validate()) return console.log('form is invalid', this.component.options.data);

					console.log('form is valid', this.component.options.data);
				},
			}),
		);

		super.render();
	}
}
