import { Component, Oxject, Button, styled } from '../..';

import ExampleView from '../DemoView/ExampleView';
import exampleCode from './ReactiveState.js.asText';

// ─── Styled primitives ────────────────────────────────────────────────────────

const Panel = styled(
	Component,
	({ colors }) => `
		padding: 16px;
		border: 1px solid ${colors.dark(colors.gray)};
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		max-width: 260px;
	`,
);

const Row = styled(
	Component,
	({ colors }) => `
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		color: ${colors.light(colors.gray)};

		& strong {
			color: ${colors.white};
			min-width: 60px;
			text-align: right;
		}
	`,
);

const Controls = styled(
	Component,
	() => `
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 16px;
	`,
);

// ─── UserCard ─────────────────────────────────────────────────────────────────

// Each child component receives a subscriber as its textContent option value.
// The subscriber wires up during construction — no reactive code inside build().
// When state changes, only the subscribed key's display updates.
class UserCard extends Panel {
	build() {
		const state = this.options.state;

		new Row({
			appendTo: this,
			append: [
				new Component({ textContent: 'Name' }),
				new Component({
					tag: 'strong',
					textContent: state.subscriber('name'),
				}),
			],
		});

		new Row({
			appendTo: this,
			append: [
				new Component({ textContent: 'Status' }),
				new Component({
					tag: 'strong',
					textContent: state.subscriber('status', s => {
						if (s === 'online') return '🟢 online';
						if (s === 'busy') return '🔴 busy';
						return '⚫ offline';
					}),
				}),
			],
		});

		new Row({
			appendTo: this,
			append: [
				new Component({ textContent: 'Unread' }),
				new Component({
					tag: 'strong',
					textContent: state.subscriber('unread', n => String(n)),
				}),
			],
		});
	}
}

// ─── Example ─────────────────────────────────────────────────────────────────

const NAMES = ['Alice', 'Bob', 'Charlie', 'Diana'];
const STATUSES = ['online', 'busy', 'offline'];

export default class Example extends ExampleView {
	build() {
		this.options.exampleCode = exampleCode;

		// State lives here so it's scoped to the example and cleaned up with it.
		const state = new Oxject({ name: 'Alice', status: 'online', unread: 0 });
		this.addCleanup('state', () => state.destroy());

		new UserCard({ state, appendTo: this.demoWrapper });

		new Controls({
			appendTo: this.demoWrapper,
			append: [
				new Button({
					textContent: 'Next name',
					onPointerPress: () => {
						state.name = NAMES[(NAMES.indexOf(state.name) + 1) % NAMES.length];
					},
				}),
				new Button({
					textContent: 'Next status',
					onPointerPress: () => {
						state.status = STATUSES[(STATUSES.indexOf(state.status) + 1) % STATUSES.length];
					},
				}),
				new Button({
					textContent: '+ Message',
					onPointerPress: () => state.unread++,
				}),
				new Button({
					textContent: 'Clear',
					onPointerPress: () => {
						state.unread = 0;
					},
				}),
			],
		});
	}
}
