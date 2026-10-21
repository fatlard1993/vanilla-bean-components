import { Component } from '../../Component';
import { Elem } from '../../Elem';
import { styled } from '../../styled';
import { Button } from '../Button';

const StyledComponent = styled(
	Component,
	({ colors, radius }) => `
		display: flex;
		gap: 4px;
		overflow-x: auto;
		border-bottom: 1px solid ${colors.alpha(colors.white, 0.12)};

		& > .vbc-button {
			flex: none;
			margin-bottom: -1px;
			padding: 6px 12px;
			border-radius: 3px 3px 0 0;
			border-bottom: 2px solid transparent;
			color: ${colors.light(colors.gray)};
		}

		& > .vbc-button:hover {
			color: ${colors.white};
		}

		/* Selected reads by its underline and weight as well as its colour */
		& > .vbc-button[aria-selected='true'] {
			border-bottom-color: ${colors.light(colors.selected)};
			color: ${colors.white};
			font-weight: bold;
		}

		/* A switch between a few views of the same thing: a pill split into its choices */
		&.variant-segmented {
			display: inline-flex;
			gap: 0;
			border: 1px solid ${colors.alpha(colors.white, 0.15)};
			border-radius: ${radius.pill};
			overflow: hidden;

			/* 30px inside the pill's 1px border: as tall as a button beside it */
			& > .vbc-button {
				height: 30px;
				margin: 0;
				padding: 0 12px;
				border: none;
				border-radius: 0;
				font-size: 0.85em;
				line-height: 30px;
			}

			& > .vbc-button[aria-selected='true'] {
				background-color: ${colors.alpha(colors.blue, 0.3)};
				font-weight: normal;
			}
		}

		& .count {
			margin-left: 6px;
			color: ${colors.light(colors.gray)};
			font-size: 0.8em;
			font-weight: normal;
		}
	`,
);

/**
 * A row of tabs, one selected. The arrow keys, Home and End move along it and select as they go.
 *
 * Panels are optional: given one per tab, only the selected tab's shows. Without them, onChange says which tab to show,
 * for content that's built on demand. A tab can carry a count (unread, items listed), shown beside its label.
 * @param {object} [options] - Tabs configuration
 * @param {Array<object>} [options.tabs] - The tabs, e.g. { id, label, icon, count, disabled }; reactive
 * @param {string} [options.selected] - The selected tab's id; defaults to the first tab
 * @param {object} [options.panels] - Each tab's panel, by id: an element or a Component, shown only while selected
 * @param {Function} [options.onChange] - Called with (id, tabs) when the selection changes
 * @param {('segmented')} [options.variant] - 'segmented' is a pill split into its choices, for switching between a
 *   few views of the same thing
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Tabs} Tabs component instance
 * @example
 * new Tabs({
 *   tabs: [{ id: 'chat', label: 'Chat', count: 2 }, { id: 'people', label: 'People' }],
 *   panels: { chat: chatList, people: peopleList },
 *   onChange: id => remember('tab', id),
 * });
 */
export default class Tabs extends StyledComponent {
	static schema = {
		role: { default: 'tablist' },
		variant: {
			enum: ['segmented'],
			set(value) {
				this.removeClass(/\bvariant-\S+\b/g);

				if (value) this.addClass(`variant-${value}`);
			},
		},
		tabs: {
			get default() {
				return [];
			},
			set(value) {
				this._renderTabs(value ?? []);
			},
		},
		selected: {
			set(value) {
				this._showSelected(value);
			},
		},
		panels: {
			set() {
				this._showSelected(this.options.selected);
			},
		},
		// Called by the tabs themselves; data, so the name isn't also wired to the DOM's change event
		onChange: { data: true },
	};

	build() {
		this._buttons = {};

		this.on({
			targetEvent: 'keydown',
			callback: event => {
				// Alt+Arrow and the like are the browser's (back, forward, word jumps), not a move between tabs
				if (event.altKey || event.ctrlKey || event.metaKey) return;

				const ids = this.options.tabs.filter(tab => !tab.disabled).map(tab => tab.id);
				const at = ids.indexOf(this.options.selected);
				const to = {
					ArrowRight: ids[(at + 1) % ids.length],
					ArrowLeft: ids[(at - 1 + ids.length) % ids.length],
					Home: ids[0],
					End: ids.at(-1),
				}[event.key];

				if (to === undefined) return;

				event.preventDefault();
				this.select(to);
				this._buttons[to]?.elem.focus();
			},
		});
	}

	_renderTabs(tabs) {
		this._buttons = {};
		this.empty();

		for (const { id, label, icon, count, disabled } of tabs) {
			const button = new Button({
				variant: 'flat',
				icon,
				role: 'tab',
				uniqueId: `${this.uniqueId}-${id}`,
				disabled: !!disabled,
				// The label as text too, so a tab with an icon isn't taken for an icon-only button
				textContent: label,
				append: new Elem({ tag: 'span', addClass: 'count', textContent: count ? String(count) : '' }),
				onPointerPress: () => this.select(id),
				appendTo: this,
			});

			button.elem.dataset.tab = id;
			this._buttons[id] = button;
		}

		this._showSelected(this.options.selected);
	}

	_showSelected(selected) {
		const { tabs = [], panels = {} } = this.options;
		const id = tabs.some(tab => tab.id === selected) ? selected : tabs[0]?.id;

		// Settled on the first tab without counting as a change
		if (id !== undefined && id !== selected) this.options.selected = id;

		for (const [tabId, button] of Object.entries(this._buttons)) {
			const chosen = tabId === id;
			const panel = panels[tabId]?.elem ?? panels[tabId];

			button.elem.setAttribute('aria-selected', String(chosen));
			button.elem.tabIndex = chosen ? 0 : -1;

			if (!panel) continue;

			button.elem.setAttribute('aria-controls', (panel.id ||= `${button.elem.id}-panel`));
			panel.setAttribute('role', 'tabpanel');
			panel.setAttribute('aria-labelledby', button.elem.id);
			// The class carries the theme's rule that a hidden panel stays hidden, whatever display the app gives it
			panel.classList.add('vbc-tabpanel');
			panel.hidden = !chosen;
		}
	}

	/**
	 * Selects a tab, showing its panel and calling onChange if it wasn't already selected.
	 * @param {string} id - The tab's id
	 */
	select(id) {
		if (id === this.options.selected || !this._buttons[id] || this._buttons[id].options.disabled) return;

		this.options.selected = id;
		this.options.onChange?.(id, this);
	}

	/**
	 * Sets the count shown beside a tab's label; zero or nothing clears it.
	 * @param {string} id - The tab's id
	 * @param {number} [count] - The count
	 */
	count(id, count) {
		const label = this._buttons[id]?.elem.querySelector('.count');

		if (label) label.textContent = count ? String(count) : '';

		const tab = this.options.tabs.find(item => item.id === id);

		if (tab) tab.count = count;
	}
}
