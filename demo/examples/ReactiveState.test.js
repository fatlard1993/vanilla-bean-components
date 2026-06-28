import { Oxject } from '@vanilla-bean/oxject';
import { Component } from '../../Component';

describe('ReactiveState example', () => {
	let state;

	beforeEach(() => {
		state = new Oxject({ name: 'Alice', status: 'online', unread: 0 });
	});

	afterEach(() => {
		state?.destroy();
		document.body.replaceChildren();
	});

	test('subscriber as textContent option wires reactively on construction', () => {
		const comp = new Component({
			textContent: state.subscriber('name'),
			appendTo: document.body,
		});

		expect(comp.elem.textContent).toBe('Alice');
		state.name = 'Bob';
		expect(comp.elem.textContent).toBe('Bob');

		comp.destroy();
	});

	test('subscriber with transform applies parser on each update', () => {
		const comp = new Component({
			textContent: state.subscriber('unread', n => `${n} messages`),
			appendTo: document.body,
		});

		expect(comp.elem.textContent).toBe('0 messages');
		state.unread = 3;
		expect(comp.elem.textContent).toBe('3 messages');

		comp.destroy();
	});

	test('each subscriber fires independently — updating one key does not affect others', () => {
		let nameFires = 0;
		let unreadFires = 0;

		const name = new Component({
			textContent: state.subscriber('name', v => {
				nameFires++;
				return v;
			}),
			appendTo: document.body,
		});

		const badge = new Component({
			textContent: state.subscriber('unread', v => {
				unreadFires++;
				return String(v);
			}),
			appendTo: document.body,
		});

		const nameBaseline = nameFires;
		const unreadBaseline = unreadFires;

		state.unread = 5;
		expect(unreadFires - unreadBaseline).toBe(1);
		expect(nameFires - nameBaseline).toBe(0); // name subscriber did not fire

		state.name = 'Charlie';
		expect(nameFires - nameBaseline).toBe(1);
		expect(unreadFires - unreadBaseline).toBe(1); // unread subscriber did not fire again

		name.destroy();
		badge.destroy();
	});

	test('state scoped to example is cleaned up on destroy', () => {
		const parser = mock(v => v);
		const comp = new Component({
			textContent: state.subscriber('name', parser),
			appendTo: document.body,
		});

		comp.destroy(); // destroys options store, removes subscription
		const callsAfterDestroy = parser.mock.calls.length;

		state.name = 'Diana';
		expect(parser.mock.calls.length).toBe(callsAfterDestroy);
	});
});
