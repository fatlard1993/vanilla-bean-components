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
