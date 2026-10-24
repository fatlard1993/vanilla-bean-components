import DemoView from '../../demo/DemoView';
import { TagList } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new TagList({
			value: ['one', '2', 'three'],
			validate: tags => (tags.length ? null : 'Keep at least one tag'),
			onChange: ({ value }) => console.log('onChange', value),
		});
	}
}
