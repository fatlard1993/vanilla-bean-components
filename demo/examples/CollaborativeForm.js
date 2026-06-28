import { Oxject } from '@vanilla-bean/oxject';
import { Component, Input, Elem, styled } from '../..';

import ExampleView from '../DemoView/ExampleView';
import exampleCode from './CollaborativeForm.js.asText';

// ─── Identity pool ────────────────────────────────────────────────────────────

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e67e22'];
const NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// ─── Form schema ──────────────────────────────────────────────────────────────

const FIELDS = [
	{ id: 'project', label: 'Project', placeholder: 'What are we building?' },
	{ id: 'goal', label: 'Goal', placeholder: 'What does success look like?' },
	{ id: 'owner', label: 'Owner', placeholder: 'Who is responsible?' },
	{ id: 'due', label: 'Due date', placeholder: 'YYYY-MM-DD' },
];

// ─── Styled primitives ────────────────────────────────────────────────────────

const FormWrap = styled(
	Component,
	({ colors }) => `
		display: flex;
		flex-direction: column;
		gap: 14px;
		max-width: 400px;
		padding: 16px;
		border: 1px solid ${colors.dark(colors.gray)};
		border-radius: 8px;
	`,
);

const FieldWrap = styled(
	Component,
	() => `
	display: flex;
	flex-direction: column;
	gap: 4px;
`,
);

const FieldHeader = styled(
	Component,
	() => `
	display: flex;
	justify-content: space-between;
	align-items: center;
`,
);

const FieldLabel = styled(
	Component,
	({ colors }) => `
	font-size: 11px;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: ${colors.gray};
`,
	{ tag: 'label' },
);

const FocusPill = styled(
	Component,
	() => `
	font-size: 10px;
	padding: 1px 7px;
	border-radius: 10px;
	font-weight: 600;
	color: white;
	opacity: 0;
	transition: opacity 0.15s;

	&.visible { opacity: 1; }
`,
);

const PresenceRow = styled(
	Component,
	({ colors }) => `
	display: flex;
	gap: 6px;
	flex-wrap: wrap;
	align-items: center;
	min-height: 22px;
	font-size: 11px;
	color: ${colors.gray};
	margin-bottom: 4px;
`,
);

const Avatar = styled(
	Component,
	() => `
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	border-radius: 10px;
	font-size: 11px;
	font-weight: 600;
	color: white;
`,
);

const Hint = styled(
	Component,
	({ colors }) => `
	font-size: 11px;
	color: ${colors.darker(colors.gray)};
	font-style: italic;
	margin-top: 4px;
`,
);

// ─── FormField ────────────────────────────────────────────────────────────────

class FormField extends FieldWrap {
	build() {
		const { state, field, myId, send } = this.options;

		const pill = new FocusPill({ appendTo: this });

		new FieldHeader({
			appendTo: this,
			append: [new FieldLabel({ textContent: field.label }), pill],
		});

		this._input = new Input({
			placeholder: field.placeholder,
			appendTo: this,
			onBlur: () => send({ type: 'form:blur', data: { userId: myId, fieldId: field.id } }),
			onKeyUp: ({ target }) => {
				send({ type: 'form:input', data: { userId: myId, fieldId: field.id, value: target.value } });
			},
		});

		// Focus event is not a built-in VBC event route, so attach directly.
		const onFocus = () => send({ type: 'form:focus', data: { userId: myId, fieldId: field.id } });
		this._input.elem.addEventListener('focus', onFocus);
		this.addCleanup('focus', () => this._input.elem.removeEventListener('focus', onFocus));

		// Watch for remote users focusing/blurring this field.
		const usersSub = state.subscribe({
			key: 'users',
			callback: users => {
				const focused = [...users.values()].find(u => u.userId !== myId && u.focusedField === field.id);

				if (focused) {
					pill.elem.textContent = `${focused.name} is here`;
					pill.elem.style.background = focused.color;
					pill.addClass('visible');
					this._input.elem.style.outline = `2px solid ${focused.color}`;
					this._input.elem.style.outlineOffset = '2px';
				} else {
					pill.removeClass('visible');
					this._input.elem.style.outline = '';
				}
			},
		});

		// Watch for remote value changes on this specific field.
		const valuesSub = state.subscribe({
			key: 'values',
			callback: values => {
				const incoming = values[field.id];
				if (incoming !== undefined && this._input.elem.value !== incoming) {
					this._input.options.value = incoming;
				}
			},
		});

		this.addCleanup('subs', () => {
			usersSub.unsubscribe();
			valuesSub.unsubscribe();
		});
	}
}

// ─── Presence bar ─────────────────────────────────────────────────────────────

class Presence extends PresenceRow {
	build() {
		const { state, myId, myName, myColor } = this.options;

		new Avatar({
			appendTo: this,
			textContent: `● ${myName} (you)`,
			style: { background: myColor },
		});

		this._others = new Elem({ appendTo: this, style: { display: 'contents' } });

		const sub = state.subscribe({
			key: 'users',
			callback: users => {
				this._others.empty();

				for (const u of users.values()) {
					if (u.userId === myId) continue;

					new Avatar({
						appendTo: this._others,
						textContent: `● ${u.name}`,
						style: { background: u.color },
					});
				}
			},
		});

		this.addCleanup('sub', () => sub.unsubscribe());
	}
}

// ─── CollaborativeForm ────────────────────────────────────────────────────────

class CollaborativeForm extends FormWrap {
	build() {
		const myId = Math.random().toString(36).slice(2, 8);
		const myColor = pick(COLORS);
		const myName = pick(NAMES);

		// All remote presence and field values live here.
		// Local field values stay in the DOM — we only push remote updates in.
		const state = new Oxject({
			users: new Map(),
			values: Object.fromEntries(FIELDS.map(f => [f.id, ''])),
		});

		this.addCleanup('state', () => state.destroy());

		const ws = new WebSocket(`ws://${location.host}/ws`);

		const send = message => {
			if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
		};

		ws.addEventListener('open', () => {
			send({ type: 'form:join', data: { userId: myId, name: myName, color: myColor } });
		});

		ws.addEventListener('message', ({ data }) => {
			let message;
			try {
				message = JSON.parse(data);
			} catch {
				return;
			}
			if (!message.type?.startsWith('form:')) return;

			const users = new Map(state.users);

			if (message.type === 'form:state') {
				for (const u of message.data.users) users.set(u.userId, { ...u });
				state.users = users;
			} else if (message.type === 'form:join') {
				users.set(message.data.userId, { ...message.data, focusedField: null });
				state.users = users;
			} else if (message.type === 'form:leave') {
				users.delete(message.data.userId);
				state.users = users;
			} else if (message.type === 'form:focus') {
				const u = users.get(message.data.userId);
				if (u) users.set(message.data.userId, { ...u, focusedField: message.data.fieldId });
				state.users = users;
			} else if (message.type === 'form:blur') {
				const u = users.get(message.data.userId);
				if (u) users.set(message.data.userId, { ...u, focusedField: null });
				state.users = users;
			} else if (message.type === 'form:input') {
				state.values = { ...state.values, [message.data.fieldId]: message.data.value };
			}
		});

		this.addCleanup('ws', () => ws.close());

		new Presence({ state, myId, myName, myColor, appendTo: this });

		for (const field of FIELDS) {
			new FormField({ state, field, myId, send, appendTo: this });
		}

		new Hint({
			appendTo: this,
			textContent: 'Open this page in another tab to collaborate in real time.',
		});
	}
}

// ─── Example ──────────────────────────────────────────────────────────────────

export default class Example extends ExampleView {
	build() {
		this.options.exampleCode = exampleCode;

		new CollaborativeForm({ appendTo: this.demoWrapper });
	}
}
