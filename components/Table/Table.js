import { capitalize, orderBy } from '../../utils';
import theme from '../../theme';
import { Icon } from '../Icon';
import { DomElem } from '../DomElem';

const defaultOptions = { tag: 'table' };

class Table extends DomElem {
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
			else this.thead = new DomElem({ tag: 'thead', appendTo: this });

			if (this.tbody) this.tbody.empty();
			else this.tbody = new DomElem({ tag: 'tbody', appendTo: this });

			if (this.tfoot) this.tfoot.empty();
			else this.tfoot = new DomElem({ tag: 'tfoot', appendTo: this });

			this.thead.append(
				new DomElem(
					{ tag: 'tr' },
					this.options.columns.map(column => {
						const th = new DomElem({ tag: 'th', ...column });

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
						new DomElem(
							{ tag: 'tr' },
							this.options.columns.map(
								column =>
									new DomElem(
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
					new DomElem(
						{ tag: 'tr' },
						this.options.footer.map(footData => new DomElem({ tag: 'td', ...footData })),
					),
				);
			}
		} else super.setOption(key, value);
	}
}

export default Table;
