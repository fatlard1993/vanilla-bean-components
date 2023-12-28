import { nanoid } from 'nanoid';

class Subscriber {
	__isSubscriber = true;

	constructor({ key, parser = _ => _, context }) {
		this.key = key;
		this.parser = parser;
		this.context = context;

		return this.current;
	}

	subscribe(callback) {
		this.subscription = this.context.subscribe({ callback, key: this.key, parser: this.parser });
	}

	unsubscribe() {
		return this.context.unsubscribe(this.subscription.id);
	}

	get current() {
		return this.parser(this.context.proxy[this.key]);
	}

	toString() {
		return this.current;
	}
}

export class Context extends EventTarget {
	constructor(target) {
		super();

		const context = this;
		this.subscriptions = {};

		this.proxy = new Proxy(target, {
			get(target, key) {
				if (context[key]) {
					if (typeof context[key] === 'function') return context[key].bind(context);

					return context[key];
				}

				return Reflect.get(target, key);
			},
			set(target, key, value) {
				const result = Reflect.set(target, key, value);

				context.onSet(key, value, result);

				return result;
			},
		});

		return this.proxy;
	}

	onSet(key, value, result) {
		// eslint-disable-next-line no-console
		if (!result) return console.error('[Context] Unable to set', { key, value });

		this.dispatchEvent(new CustomEvent('set', { detail: { key, value } }));
		this.dispatchEvent(new CustomEvent(key, { detail: value }));
	}

	subscriber(key, parser) {
		return new Subscriber({ key, parser, context: this });
	}

	subscribe({ callback, key, parser = _ => _ }) {
		const id = nanoid();
		const subscription = ({ detail }) => callback(parser(detail));

		subscription.key = key;
		this.subscriptions[id] = subscription;
		this.addEventListener(key, subscription);

		return { unsubscribe: () => this.unsubscribe(id), current: parser(this.proxy[key]), id };
	}

	unsubscribe(id) {
		const { key } = this.subscriptions[id];
		this.removeEventListener(key, this.subscriptions[id]);

		delete this.subscriptions[id];
	}
}
