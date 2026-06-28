import { observeElementConnection } from './observeElementConnection';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

describe('observeElementConnection', () => {
	afterEach(() => {
		document.body.replaceChildren();
	});

	test('fires onConnected when target is directly appended', async () => {
		const target = document.createElement('div');
		const onConnected = mock();
		const handle = observeElementConnection({ target, onConnected, onDisconnected: mock() });

		document.body.appendChild(target);
		await tick();

		expect(onConnected).toHaveBeenCalledTimes(1);
		handle.disconnect();
	});

	test('fires onDisconnected when target is directly removed', async () => {
		const target = document.createElement('div');
		document.body.appendChild(target);
		await tick();

		const onDisconnected = mock();
		const handle = observeElementConnection({ target, onConnected: mock(), onDisconnected });

		document.body.removeChild(target);
		await tick();

		expect(onDisconnected).toHaveBeenCalledTimes(1);
		handle.disconnect();
	});

	test('fires onConnected when an ancestor containing the target is appended', async () => {
		const parent = document.createElement('div');
		const target = document.createElement('span');
		parent.appendChild(target);

		const onConnected = mock();
		const handle = observeElementConnection({ target, onConnected, onDisconnected: mock() });

		document.body.appendChild(parent);
		await tick();

		expect(onConnected).toHaveBeenCalledTimes(1);
		handle.disconnect();
	});

	test('fires onDisconnected when an ancestor containing the target is removed', async () => {
		const parent = document.createElement('div');
		const target = document.createElement('span');
		parent.appendChild(target);
		document.body.appendChild(parent);
		await tick();

		const onDisconnected = mock();
		const handle = observeElementConnection({ target, onConnected: mock(), onDisconnected });

		document.body.removeChild(parent);
		await tick();

		expect(onDisconnected).toHaveBeenCalledTimes(1);
		handle.disconnect();
	});

	test('does not fire after disconnect', async () => {
		const target = document.createElement('div');
		const onConnected = mock();
		const handle = observeElementConnection({ target, onConnected, onDisconnected: mock() });

		handle.disconnect();
		document.body.appendChild(target);
		await tick();

		expect(onConnected).not.toHaveBeenCalled();
	});

	test('multiple targets all receive their callbacks', async () => {
		const target1 = document.createElement('div');
		const target2 = document.createElement('div');
		const cb1 = mock();
		const cb2 = mock();

		const h1 = observeElementConnection({ target: target1, onConnected: cb1, onDisconnected: mock() });
		const h2 = observeElementConnection({ target: target2, onConnected: cb2, onDisconnected: mock() });

		document.body.appendChild(target1);
		document.body.appendChild(target2);
		await tick();

		expect(cb1).toHaveBeenCalled();
		expect(cb2).toHaveBeenCalled();

		h1.disconnect();
		h2.disconnect();
	});

	test('deregistered target does not fire after its disconnect', async () => {
		const target1 = document.createElement('div');
		const target2 = document.createElement('div');
		const cb1 = mock();
		const cb2 = mock();

		const h1 = observeElementConnection({ target: target1, onConnected: cb1, onDisconnected: mock() });
		const h2 = observeElementConnection({ target: target2, onConnected: cb2, onDisconnected: mock() });

		h1.disconnect();

		document.body.appendChild(target1);
		document.body.appendChild(target2);
		await tick();

		expect(cb1).not.toHaveBeenCalled();
		expect(cb2).toHaveBeenCalled();

		h2.disconnect();
	});
});
