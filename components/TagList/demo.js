import { TagList, Tag, Label, Select, TextInput, Button } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const readOnlyOptions = ['enabled', 'disabled'];
		const tags = ['one', '2', 'three'];

		let textContent = 'textContent';
		let readOnly = false;

		const tagList = new TagList({ tags, appendTo: this.demoWrapper });

		const addTag = () => new Tag({ appendTo: tagList, textContent, readOnly });

		new Label({
			label: 'ReadOnly',
			appendChild: new Select({
				value: readOnlyOptions[0],
				options: readOnlyOptions,
				onChange: ({ value }) => {
					readOnly = value === readOnlyOptions[0];
				},
			}),
		});

		new Label({
			label: 'Add New Tag',
			appendTo: this.demoContent,
			appendChildren: [
				new Label({
					label: 'ReadOnly',
					appendChild: new Select({
						value: readOnlyOptions[0],
						options: readOnlyOptions,
						onChange: ({ value }) => {
							readOnly = value === readOnlyOptions[0];
						},
					}),
				}),
				new Label({
					label: 'textContent',
					appendChild: new TextInput({
						value: textContent,
						onKeyUp: ({ target: { value } }) => (textContent = value),
					}),
				}),
				new Button({ textContent: 'Create', onPointerPress: addTag }),
			],
		});
	}
}
