import { capitalize, orderBy } from '../../utils';
import theme from '../../theme';
import { Elem } from '../../Elem';
import { Component } from '../../Component';
import { Icon } from '../Icon';

const defaultOptions = { tag: 'table' };

class Table extends Component {
	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				onSort: (property, direction) => {
					this.options.data = this.options.data.sort(orderBy({ property, direction }));
				},
				...options,
				columns: options.columns.map(column =>
					typeof column === 'string' ? { key: column, content: capitalize(column) } : column,
				),
				footer: options.footer?.map(column => (typeof column === 'string' ? { content: capitalize(column) } : column)),
			},
			...children,
		);
	}

	render() {
		super.render();
	}

	setOption(key, value) {
		if (key === 'sort' && this.rendered) {
			this.options.onSort(value, this.options.sortDirection);
		} else if (key === 'sortDirection' && this.rendered) {
			this.options.onSort(this.options.sortProperty, value);
		} else if (key === 'data' || key === 'selection') {
			if (this.thead) this.thead.empty();
			else this.thead = new Elem({ tag: 'thead', appendTo: this });

			if (this.tbody) this.tbody.empty();
			else this.tbody = new Elem({ tag: 'tbody', appendTo: this });

			if (this.tfoot) this.tfoot.empty();
			else this.tfoot = new Elem({ tag: 'tfoot', appendTo: this });

			this.thead.append(
				new Component(
					{ tag: 'tr' },
					this.options.columns.map(column => {
						const th = new Component({ tag: 'th', ...column });

						if (column.sort) {
							new Icon({
								icon: this.options.subscriber('sortDirection', () => {
									if (this.options.sortProperty !== column.key) return 'sort';

									return this.options.sortDirection === 'asc' ? 'sort-down' : 'sort-up';
								}),
								style: this.options.subscriber('sortDirection', () => ({
									display: 'inline',
									marginLeft: '6px',
									...(this.options.sortProperty !== column.key
										? { color: theme.colors.dark(theme.colors.gray) }
										: { color: theme.colors.white }),
								})),
								appendTo: th,
							});

							th.onPointerPress(() => {
								if (this.options.sortProperty === column.key) {
									this.options.sortDirection = this.options.sortDirection === 'asc' ? 'desc' : 'asc';
									return;
								}

								this.options.sortProperty = column.key;
								this.options.sortDirection = 'desc';
							});
						}

						return th;
					}),
				),
			);

			this.tbody.append(
				this.options.data.map(
					rowData =>
						new Component(
							{ tag: 'tr' },
							this.options.columns.map(
								column =>
									new Component(
										{
											tag: 'td',
											...(typeof column.dataColumn === 'function'
												? column.dataColumn({ column, rowData, table: this })
												: column.dataColumn),
										},
										column.key ? rowData[column.key].toString() : undefined,
									),
							),
						),
				),
			);

			if (this.options.footer) {
				this.tfoot.append(
					new Component(
						{ tag: 'tr' },
						this.options.footer.map(footData => new Component({ tag: 'td', ...footData })),
					),
				);
			}
		} else super.setOption(key, value);
	}
}

export default Table;
