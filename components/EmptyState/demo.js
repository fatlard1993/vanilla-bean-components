import DemoView from '../../demo/DemoView';
import { EmptyState } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new EmptyState({
			icon: 'seedling',
			title: 'No fields yet',
			message: 'Fields you draw on the map show up here.',
			action: { textContent: 'Draw a field', onPointerPress: () => console.log('draw') },
		});
	}
}
