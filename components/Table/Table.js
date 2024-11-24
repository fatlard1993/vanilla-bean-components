import { capitalize } from '../../utils/string';
import { DomElem } from '../DomElem';

const defaultOptions = { tag: 'table' };

class Table extends DomElem {
	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				...options,
				columns: options.columns.map(column =>
					typeof column === 'string' ? { key: column, content: capitalize(column) } : column,
				),
				footer: options.footer.map(column => (typeof column === 'string' ? { content: capitalize(column) } : column)),
			},
			...children,
		);
	}

	render() {
		super.render();

		this.append(
			new DomElem(
				{ tag: 'thead' },
				new DomElem(
					{ tag: 'tr' },
					this.options.columns.map(({ label, ...column }) => new DomElem({ tag: 'th', ...column }, label)),
				),
			),
		);

		this.append(
			new DomElem(
				{ tag: 'tbody' },
				this.options.data.map(
					rowData =>
						new DomElem(
							{ tag: 'tr' },
							this.options.columns.map(column => new DomElem({ tag: 'td' }, rowData[column.key].toString())),
						),
				),
			),
		);

		if (this.options.footer) {
			this.append(
				new DomElem(
					{ tag: 'tfoot' },
					new DomElem(
						{ tag: 'tr' },
						this.options.footer.map(footData => new DomElem({ tag: 'td', ...footData })),
					),
				),
			);
		}
	}

	setOption(key, value) {
		super.setOption(key, value);
	}
}

export default Table;
