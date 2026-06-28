import { capitalize, orderBy } from '../../utils';
import theme from '../../theme';
import { Elem } from '../../Elem';
import { Component } from '../../Component';
import { Icon } from '../Icon';

const defaultOptions = { tag: 'table' };

/**
 * Data table component with sorting, column configuration, and footer support.
 *
 * Renders tabular data with configurable columns, sortable headers, and optional footer.
 * Supports custom cell rendering and automatic sorting functionality.
 * @param {object} [options={}] - Table configuration options
 * @param {string} [options.tag='table'] - HTML tag for the table element
 * @param {Array<string|object>} options.columns - Column definitions with keys and optional configurations
 * @param {Array<object>} [options.data] - Array of data objects to display in table rows
 * @param {Array<string|object>} [options.footer] - Footer row data
 * @param {Function} [options.onSort] - Custom sort function, defaults to built-in sorting
 * @param {string} [options.sortProperty] - Currently sorted column key
 * @param {string} [options.sortDirection] - Sort direction ('asc' or 'desc')
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Table} Table component instance
 */
class Table extends Component {
	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				onSort: (property, direction) => {
					this.options.data = this.options.data.sort(orderBy({ property, direction }));
				},
				...options,
				columns: (options.columns || []).map(column =>
					typeof column === 'string' ? { key: column, content: capitalize(column) } : column,
				),
				footer: options.footer?.map(column => (typeof column === 'string' ? { content: capitalize(column) } : column)),
			},
			...children,
		);
	}

	static handlers = {
		sortDirection(value) {
			if (this.rendered) this.options.onSort(this.options.sortProperty, value);
		},
		data() {
			this._renderTable();
		},
		selection() {
			this._renderTable();
		},
	};

	_renderTable() {
		const value = this.options.data;

		this._sortSubscribers?.forEach(sub => sub.destroy?.());
		this._sortSubscribers = null;

		if (!value) return;

		if (this.thead) this.thead.empty();
		else this.thead = new Elem({ tag: 'thead', appendTo: this });

		if (this.tbody) this.tbody.empty();
		else this.tbody = new Elem({ tag: 'tbody', appendTo: this });

		if (this.tfoot) this.tfoot.empty();
		else this.tfoot = new Elem({ tag: 'tfoot', appendTo: this });

		this._sortSubscribers = [];
		this.replaceCleanup('sortSubscribers', () => this._sortSubscribers?.forEach(sub => sub.destroy?.()));

		this.thead.append(
			new Component(
				{ tag: 'tr' },
				this.options.columns.map(column => {
					const th = new Component({ tag: 'th', ...column, scope: 'col' });

					if (column.sort) {
						const iconSub = this.options.subscriber('sortDirection', () => {
							if (this.options.sortProperty !== column.key) return 'sort';

							return this.options.sortDirection === 'asc' ? 'sort-down' : 'sort-up';
						});
						const styleSub = this.options.subscriber('sortDirection', () => ({
							display: 'inline',
							marginLeft: '6px',
							...(this.options.sortProperty !== column.key
								? { color: theme.colors.dark(theme.colors.gray) }
								: { color: theme.colors.white }),
						}));

						this._sortSubscribers.push(iconSub, styleSub);

						const updateAriaSort = () => {
							let ariaSort = 'none';
							if (this.options.sortProperty === column.key) {
								ariaSort = this.options.sortDirection === 'asc' ? 'ascending' : 'descending';
							}
							th.elem.setAttribute('aria-sort', ariaSort);
						};
						updateAriaSort();

						const sortDirHandler = () => updateAriaSort();
						const sortPropHandler = () => updateAriaSort();
						this.options.addEventListener('sortDirection', sortDirHandler);
						this.options.addEventListener('sortProperty', sortPropHandler);
						this._sortSubscribers.push({
							destroy: () => {
								this.options.removeEventListener('sortDirection', sortDirHandler);
								this.options.removeEventListener('sortProperty', sortPropHandler);
							},
						});

						new Icon({
							icon: iconSub,
							style: styleSub,
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
									column.key ? rowData[column.key]?.toString() : undefined,
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
	}
}

export default Table;
