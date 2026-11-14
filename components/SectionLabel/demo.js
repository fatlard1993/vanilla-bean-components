import DemoView from '../../demo/DemoView';
import { Component } from '../../Component';
import { Elem } from '../../Elem';
import { SectionLabel } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new SectionLabel({ textContent: 'Recent' });

		new Component({ textContent: 'A group of things sits under its label.', appendTo: this.demoWrapper });

		// In a header row, beside its total: the row spaces it
		const row = new Elem({
			appendTo: this.demoWrapper,
			style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '18px' },
		});

		new SectionLabel({ textContent: 'Net worth', inRow: true, appendTo: row });
		new Elem({ tag: 'strong', textContent: '$150,000', appendTo: row });
	}
}
