import { capitalize, orderBy } from '../../utils';
import theme from '../../theme';
import { Elem } from '../../Elem';
import { Component } from '../../Component';
import { Icon } from '../Icon';

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
 * @param {*} [options.selection] - Caller-owned selection state. The table stores it and re-renders
 *   when it is reassigned, but never interprets it; `dataColumn` functions read it back off
 *   `table.options.selection` to render per-row state. Mutating a property of it deliberately does
 *   not re-render, so toggling one row's checkbox does not rebuild the table under the pointer
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Table} Table component instance
 */
class Table extends Component {
	static schema = {
		tag: { default: 'table' },
		sortDirection: {
			enum: ['asc', 'desc'],
			set(value) {
				if (!this.rendered) return;
				if (this.options.onSort) this.options.onSort(this.options.sortProperty, value);
				else
					this.options.data = this.options.data.sort(
						orderBy({ property: this.options.sortProperty, direction: value }),
					);
			},
		},
		data: {
			set() {
				this._renderTable();
			},
		},
		selection: {
			set() {
				this._renderTable();
			},
		},
		columns: {
			set() {
				if (this.rendered) this._renderTable();
			},
		},
		footer: {
			set() {
				if (this.rendered) this._renderTable();
			},
		},
		// Read from this.options at sort time; sortProperty changes are always followed
		// by a sortDirection change, which drives the re-render
		sortProperty: {},
		onSort: {},
	};

	_renderTable() {
		const value = this.options.data;
		// Columns and footer accept string shorthand - normalized at read time so
		// construction and reactive assignment take the same path
		const columns = (this.options.columns || []).map(column =>
			typeof column === 'string' ? { key: column, content: capitalize(column) } : column,
		);
		// Footer entries pair with columns by key, not by declaration order - an entry may
		// declare its own `key`; otherwise it falls back to the column at the same index, so
		// existing footer configs that never set `key` keep working unless columns are reordered.
		const footer = this.options.footer?.map((column, index) => {
			const normalized = typeof column === 'string' ? { content: capitalize(column) } : column;

			return { key: columns[index]?.key, ...normalized };
		});

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
				columns.map(column => {
					// key/sort/dataColumn are column config for the Table itself - keep them off the th elem
					const { key, sort, ...columnOptions } = column;
					delete columnOptions.dataColumn;
					const th = new Component({ tag: 'th', ...columnOptions, scope: 'col' });

					if (sort) {
						const iconSub = this.options.subscriber('sortDirection', () => {
							if (this.options.sortProperty !== key) return 'sort';

							return this.options.sortDirection === 'asc' ? 'sort-down' : 'sort-up';
						});
						const styleSub = this.options.subscriber('sortDirection', () => ({
							display: 'inline',
							marginLeft: '6px',
							...(this.options.sortProperty !== key
								? { color: theme.colors.dark(theme.colors.gray) }
								: { color: theme.colors.white }),
						}));

						this._sortSubscribers.push(iconSub, styleSub);

						const updateAriaSort = () => {
							let ariaSort = 'none';
							if (this.options.sortProperty === key) {
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
							if (this.options.sortProperty === key) {
								this.options.sortDirection = this.options.sortDirection === 'asc' ? 'desc' : 'asc';
								return;
							}

							this.options.sortProperty = key;
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
						columns.map(
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

		if (footer) {
			const footerByKey = new Map(footer.map(footData => [footData.key, footData]));

			this.tfoot.append(
				new Component(
					{ tag: 'tr' },
					columns.map(column => {
						const { key: _footKey, ...footOptions } = footerByKey.get(column.key) || {};

						return new Component({ tag: 'td', ...footOptions });
					}),
				),
			);
		}
	}
}

export default Table;
