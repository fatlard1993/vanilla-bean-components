import { nanoid } from 'nanoid';

const subscriberKeys = new Set(['__isSubscriber', 'key', 'parser', 'context', 'proxy', 'subscribe', 'unsubscribe']);

class Subscriber {
	__isSubscriber = true;

	constructor({ key, parser = _ => _, context }) {
		this.key = key;
		this.parser = parser;
		this.context = context;

		const subscriber = this;

		this.proxy = new Proxy(
			{},
			{
				get(_, _key) {
					if (subscriberKeys.has(_key)) {
						if (typeof subscriber[_key] === 'function') return subscriber[_key].bind(subscriber);

						return subscriber[_key];
					}

					const primitive = parser(context.proxy[key]);
					const value = primitive?.[_key];

					if (typeof value === 'function') return value.bind(primitive);
					if (_key === 'toJSON') return () => primitive;

					return value;
				},
			},
		);

		return this.proxy;
	}

	subscribe(callback) {
		this.subscription = this.context.subscribe({ callback, key: this.key, parser: this.parser });

		return this.subscription;
	}

	unsubscribe() {
		return this.context.unsubscribe(this.subscription.id);
	}
}

export class Context extends EventTarget {
	constructor(_target) {
		super();

		const context = this;
		this.subscriptions = {};

		this.target = Object.fromEntries(
			Object.entries(_target).map(([key, value]) => {
				if (value?.__isSubscriber) {
					value.subscribe(_value => (this.proxy[key] = _value));
					value = value.toJSON();
				}

				return [key, value];
			}),
		);

		this.proxy = new Proxy(this.target, {
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
