import DemoView from '../../demo/DemoView';
import { Button } from '../Button';
import { Notify } from '../Notify';
import { FormDialog } from '.';

export default class Demo extends DemoView {
	build() {
		const record = { name: 'Garden', color: '#3366cc', notes: '' };

		const open = () =>
			new FormDialog({
				header: `Edit | ${record.name}`,
				inputs: [
					{ key: 'name', validate: value => (value ? null : 'Required') },
					{ key: 'color', type: 'color' },
					{ key: 'notes', tag: 'textarea' },
				],
				data: record,
				// A failed request keeps the dialog open and says why: try the name "taken"
				onSave: data => {
					if (data.name === 'taken') return { status: 'error', body: { error: 'That name is taken' } };

					Object.assign(record, data);
					new Notify({ intent: 'success', content: `Saved ${record.name}` });
				},
				onDelete: () => new Notify({ intent: 'info', content: `Deleted ${record.name}` }),
				confirmDelete: `Delete "${record.name}"?`,
			});

		new Button({ appendTo: this.demoWrapper, textContent: 'Open', onPointerPress: open });
	}
}
