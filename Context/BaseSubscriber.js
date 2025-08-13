// Context/BaseSubscriber.js
import ErrorHandler from './ErrorHandler.js';

/**
 * Abstract base for reactive subscribers.
 * Provides proxy that delegates property access to current value.
 * @abstract
 */
export default class BaseSubscriber {
	__isSubscriber = true;

	constructor() {
		this.subscriberCallbacks = new Set();
		this._isDestroyed = false;
	}

	/**
	 * Is this subscriber destroyed.
	 * @returns {boolean} True if destroyed
	 */
	get isDestroyed() {
		return this._isDestroyed;
	}

	/**
	 * Create proxy that delegates to current value or subscriber methods.
	 * @param {string[]} subscriberKeys - Methods accessing subscriber instead of value
	 * @returns {Proxy} Proxy delegating to getCurrentValue() + subscriber methods
	 * @protected
	 */
	createProxy(subscriberKeys) {
		const subscriber = this;
		const allKeys = [...subscriberKeys, Symbol.dispose];

		return new Proxy(
			{},
			{
				get(_, key) {
					if (allKeys.includes(key)) {
						const value = subscriber[key];
						if (typeof value === 'function') return value.bind(subscriber);
						return value;
					}

					try {
						const currentValue = subscriber.getCurrentValue();
						if (currentValue === null || currentValue === undefined) {
							return currentValue;
						}

						const value = currentValue[key];
						if (typeof value === 'function') {
							return value.bind(currentValue);
						}
						if (key === 'toJSON') return () => currentValue;
						return value;
					} catch (error) {
						ErrorHandler.handleParserError(
							error,
							subscriber.context || subscriber,
							subscriber.key || 'combiner',
							'property-access',
						);
						return null;
					}
				},

				apply(_, thisArg, argumentsList) {
					try {
						const currentValue = subscriber.getCurrentValue();
						if (typeof currentValue === 'function') {
							return currentValue.apply(thisArg, argumentsList);
						}
						throw new TypeError('subscriber is not a function');
					} catch (error) {
						ErrorHandler.handleSubscriptionSetupError(error, subscriber.key, this.constructor.name);

						throw new TypeError('subscriber is not a function');
					}
				},
			},
		);
	}

	/**
	 * Subscribe to value changes.
	 * @param {Function} callback - Called with new value on changes
	 * @returns {{unsubscribe: Function, current: *}} Subscription control + current value
	 * @throws {TypeError} When callback is not a function
	 */
	subscribe(callback) {
		if (typeof callback !== 'function') {
			ErrorHandler.handleValidationError(
				`${this.constructor.name} subscribe callback must be a function`,
				typeof callback,
				'function',
			);
		}

		if (this.isDestroyed) {
			ErrorHandler.handleWarning(`Cannot subscribe to destroyed ${this.constructor.name}`);
			return {
				unsubscribe: () => ErrorHandler.handleWarning(`Unsubscribe called on destroyed ${this.constructor.name}`),
				current: null,
			};
		}

		this.subscriberCallbacks.add(callback);

		let current;
		try {
			current = this.getCurrentValue();
		} catch (error) {
			ErrorHandler.handleParserError(error, this.context || this, this.key || 'combiner', 'initial-subscription');
			current = null;
		}

		return {
			unsubscribe: () => {
				this.subscriberCallbacks.delete(callback);
			},
			current,
		};
	}

	/**
	 * Remove most recent subscription.
	 */
	unsubscribe() {
		const lastCallback = Array.from(this.subscriberCallbacks).pop();
		if (lastCallback) {
			this.subscriberCallbacks.delete(lastCallback);
		} else {
			ErrorHandler.handleWarning(`No active ${this.constructor.name} subscription to unsubscribe`);
		}
	}

	/**
	 * Get current value for JSON serialization.
	 * @returns {*} Current parsed value or null on error
	 */
	toJSON() {
		try {
			return this.getCurrentValue();
		} catch (error) {
			ErrorHandler.handleParserError(error, this.context || this, this.key || 'combiner', 'toJSON');
			return null;
		}
	}

	/**
	 * Notify all subscribers of value change.
	 * @param {*} value - New value to send to callbacks
	 * @protected
	 */
	notifySubscribers(value) {
		if (this.isDestroyed) return;

		this.subscriberCallbacks.forEach(callback => {
			try {
				callback(value);
			} catch (error) {
				ErrorHandler.handleWarning(`${this.constructor.name} callback error: ${error.message}`);
			}
		});
	}

	/**
	 * Clean up all subscriptions and mark as destroyed.
	 */
	destroy() {
		this._isDestroyed = true;
		this.subscriberCallbacks.clear();
	}

	[Symbol.dispose]() {
		this.destroy();
	}

	/**
	 * Get current parsed value.
	 * @returns {*} Current value after parsing/transformation
	 * @abstract
	 */
	getCurrentValue() {
		throw new Error('getCurrentValue must be implemented by subclass');
	}
}
