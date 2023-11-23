import { nanoid } from 'nanoid';

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

	subscriber(key, parser = value => value) {
		return {
			__isSubscriber: true,
			subscribe: callback => {
				const id = nanoid();
				const subscription = ({ detail }) => callback(parser(detail));

				this.subscriptions[id] = subscription;
				this.addEventListener(key, subscription);

				return { unsubscribe: () => this.unsubscribe(key, id), current: parser(this.proxy[key]) };
			},
			current: parser(this.proxy[key]),
		};
	}

	unsubscribe(key, id) {
		this.removeEventListener(key, this.subscriptions[id]);

		delete this.subscriptions[id];
	}
}
