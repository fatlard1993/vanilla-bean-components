import { Context } from './context';

test('Context > Must provide first-tier access to properties', () => {
	expect(new Context({ x: ['one', 'two'] }).x).toStrictEqual(['one', 'two']);
});

test('Context > Must expose a generic "set" event', () => {
	const context = new Context({ x: 'x', y: 'y' });
	const eventMock = global.mock(() => {});

	context.addEventListener('set', eventMock);

	context.x = 'y';
	context.y = 'z';

	expect(eventMock.mock.calls.length).toStrictEqual(2);
});

test('Context > Must expose a specific {key} event', () => {
	const context = new Context({ x: 'x', y: 'y' });
	const eventMock = global.mock(() => {});

	context.addEventListener('x', eventMock);

	context.x = 'y';
	context.y = 'z';

	expect(eventMock.mock.calls.length).toStrictEqual(1);
});

test('Context > Must provide a subscriber factory', () => {
	const context = new Context({ x: 'x', y: 'y' });
	const eventMock = global.mock(() => {});

	const subscriber = context.subscriber('x');

	expect(subscriber.__isSubscriber).toStrictEqual(true);
	expect(subscriber.toString()).toStrictEqual('x');

	context.x = 0;

	subscriber.subscribe(eventMock);

	context.x = 'y';
	context.y = 'z';

	expect(eventMock.mock.calls.length).toStrictEqual(1);
});

test('Context > Subscriber factory > Must accept value parser function', () => {
	const context = new Context({ x: 'x', y: 'y' });
	const eventMock = global.mock(() => {});
	const parserMock = global.mock(value => `prefix: ${value}`);

	const subscriber = context.subscriber('x', parserMock);

	expect(subscriber.toString()).toStrictEqual('prefix: x');

	subscriber.subscribe(eventMock);

	context.x = 'y';

	expect(eventMock.mock.calls.length).toStrictEqual(1);
	expect(parserMock.mock.calls.length).toStrictEqual(3);
});

test('Context > Subscriber factory > Must provide unsubscribe method', () => {
	const context = new Context({ x: 'x', y: 'y' });
	const eventMock = global.mock(() => {});

	const subscriber = context.subscriber('x');

	const { unsubscribe } = subscriber.subscribe(eventMock);

	context.x = 'y';

	unsubscribe();

	context.x = 'z';

	expect(eventMock.mock.calls.length).toStrictEqual(1);
});
