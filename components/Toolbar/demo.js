import DemoView from '../../demo/DemoView';
import { Button } from '../Button';
import { Input } from '../Input';
import { Toolbar } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Toolbar({
			append: [
				new Button({ icon: 'plus', textContent: 'Add' }),
				new Button({ textContent: 'Import', variant: 'flat' }),
				new Input({ placeholder: 'Search', style: { flex: '1', minWidth: '10em', width: 'auto' } }),
			],
		});

		new Toolbar({
			appendTo: this.demoWrapper,
			variant: 'bar',
			heading: 'North 80',
			style: { marginTop: '12px' },
			append: [
				new Button({ icon: 'arrow-left', variant: 'flat', addClass: 'start', title: 'Back' }),
				new Button({ icon: 'pen', variant: 'flat', title: 'Edit' }),
				new Button({ icon: 'trash', variant: 'flat', title: 'Delete' }),
			],
		});
	}
}
