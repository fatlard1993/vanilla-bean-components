import { TagList, Tag, Label, Select, TextInput, Button } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const readOnlyOptions = ['enabled', 'disabled'];
		const tags = ['one', '2', 'three'];

		let tag = 'tag';
		let readOnly = false;

		const tagList = new TagList({ tags, appendTo: this.demoWrapper });

		const addTag = () => new Tag({ appendTo: tagList, tag, readOnly });

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
					label: 'Tag',
					appendChild: new TextInput({
						value: tag,
						onKeyUp: ({ target: { value } }) => (tag = value),
					}),
				}),
				new Button({ textContent: 'Create', onPointerPress: addTag }),
			],
		});
	}
}
