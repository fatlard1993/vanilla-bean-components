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
	}
}
