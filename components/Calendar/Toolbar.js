import { capitalize } from '../../utils';
import { styled } from '../../styled';
import { Component } from '../../Component';
import { Button } from '../Button';

const Title = styled(
	Component,
	() => `
		text-align: center;
	`,
);
const Left = styled(
	Component,
	() => `
		margin-left: 6px;
	`,
);
const Right = styled(
	Component,
	() => `
		margin-right: 6px;
	`,
);

export const VIEWS = Object.freeze(['day', 'week', 'month']);

/**
 * Navigation and view-switching header for a Calendar.
 *
 * Renders previous/today/next controls on the left, the calendar's title in the middle, and one
 * button per available view on the right. The toolbar holds no state of its own — every control
 * calls straight through to the calendar it was given.
 * @param {object} [options={}] - Toolbar configuration options
 * @param {Calendar} options.calendar - The calendar these controls drive; its `previous`, `today`,
 *   `next` and `setView` methods are called from the buttons. Required — the toolbar constructs
 *   without it, but every control throws on press
 * @param {Array<string>} [options.views=VIEWS] - View names to offer, one button each
 * @param {('day'|'week'|'month')} [options.view] - The currently active view; assigning it moves the
 *   `pressed` class onto the matching button. Set by the calendar, not usually by a caller
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Toolbar} Toolbar component instance
 */
class Toolbar extends Component {
	static schema = {
		views: { default: VIEWS },
		calendar: {},
		view: {
			set(value) {
				for (const [view, button] of Object.entries(this._viewButtons || {})) {
					button.toggleClass('pressed', view === value);
				}
			},
		},
	};

	static prepareOptions(options) {
		return {
			...options,
			style: {
				display: 'flex',
				justifyContent: 'space-between',
				...options.style,
			},
		};
	}

	build() {
		new Left({
			appendTo: this,
			append: ['previous', 'today', 'next'].map(
				action =>
					new Button({
						textContent: { next: '>', today: 'Today', previous: '<' }[action],
						'aria-label': action,
						onPointerPress: () => {
							this.options.calendar[action]();
						},
					}),
			),
		});

		this.title = new Title({ appendTo: this });

		this._viewButtons = {};

		new Right({
			appendTo: this,
			append: this.options.views.map(
				view =>
					(this._viewButtons[view] = new Button({
						addClass: [`set-${view}`],
						textContent: capitalize(view),
						onPointerPress: () => {
							this.options.calendar.setView(view);
						},
					})),
			),
		});
	}
}

export default Toolbar;
