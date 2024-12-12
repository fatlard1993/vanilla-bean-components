const subscriberKeys = new Set(['__isSubscriber', 'key', 'parser', 'context', 'proxy', 'subscribe', 'unsubscribe']);

export default class Subscriber {
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
