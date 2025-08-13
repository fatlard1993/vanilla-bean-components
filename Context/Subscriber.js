import BaseSubscriber from './BaseSubscriber.js';
import ErrorHandler from './ErrorHandler.js';

const subscriberKeys = ['__isSubscriber', 'key', 'parser', 'context', 'proxy', 'subscribe', 'unsubscribe', 'toJSON'];

/**
 * Reactive value updating when a Context property changes.
 * Proxy provides transparent access to parsed property value.
 * @augments BaseSubscriber
 * @example
 * const upper = context.subscriber('name', s => s.toUpperCase());
 * upper.length; // String property
 * upper.slice(0, 3); // String method
 * upper.subscribe(callback); // Subscriber method
 */
export default class Subscriber extends BaseSubscriber {
	/**
	 * Create reactive subscriber for a Context property.
	 * @param {object} config - Configuration object
	 * @param {string} config.key - Property name to watch
	 * @param {Function} [config.parser] - Transform function for the value
	 * @param {import ('./Context.js')} config.context - Context instance to watch
	 * @returns {Proxy} Proxy providing parsed property value + subscriber methods
	 * @throws {TypeError} When key is not string, parser is not function, or context is invalid
	 */
	constructor({ key, parser = _ => _, context }) {
		super();

		if (typeof key !== 'string') {
			ErrorHandler.handleValidationError('Subscriber key must be a string', typeof key, 'string');
		}

		if (parser !== null && parser !== undefined && typeof parser !== 'function') {
			ErrorHandler.handleValidationError('Subscriber parser must be a function', typeof parser, 'function');
		}

		if (!context || typeof context !== 'object') {
			ErrorHandler.handleValidationError(
				'Subscriber context must be a Context instance',
				context === null ? 'null' : typeof context,
				'Context instance',
			);
		}

		if (context.isDestroyed) {
			ErrorHandler.handleValidationError(
				'Cannot create subscriber on destroyed context',
				'destroyed context',
				'active context',
			);
		}

		this.key = key;
		this.parser = parser;
		this.context = context;
		this.subscription = null;

		this.proxy = this.createProxy(subscriberKeys);
		return this.proxy;
	}

	/**
	 * Get current parsed property value.
	 * @returns {*} Property value after parser transformation
	 * @override
	 */
	getCurrentValue() {
		return this.parser(this.context.target[this.key]);
	}

	/**
	 * Subscribe to property changes using Context subscription system.
	 * @param {Function} callback - Called with parsed value on changes
	 * @returns {{unsubscribe: Function, current: *, id: string}} Subscription control
	 * @throws {TypeError} When callback is not a function
	 * @override
	 */
	subscribe(callback) {
		if (typeof callback !== 'function') {
			ErrorHandler.handleValidationError('Subscribe callback must be a function', typeof callback, 'function');
		}

		if (this.context.isDestroyed) {
			ErrorHandler.handleWarning('Cannot subscribe to destroyed context');
			return {
				unsubscribe: () => ErrorHandler.handleWarning('Unsubscribe called on destroyed context subscription'),
				current: null,
				id: null,
				isDestroyed: true,
			};
		}

		try {
			this.subscription = this.context.subscribe({
				callback,
				key: this.key,
				parser: this.parser,
			});

			return this.subscription;
		} catch (error) {
			ErrorHandler.handleWarning(`Failed to create subscriber subscription: ${error.message}`);
			return {
				unsubscribe: () => {},
				current: null,
				id: null,
				isDestroyed: true,
			};
		}
	}

	/**
	 * Remove current subscription.
	 * @override
	 */
	unsubscribe() {
		if (!this.subscription) {
			ErrorHandler.handleWarning('No active subscription to unsubscribe');
			return;
		}

		try {
			this.context.unsubscribe(this.subscription.id);
			this.subscription = null;
		} catch (error) {
			ErrorHandler.handleWarning(`Error during subscriber unsubscribe: ${error.message}`);
			this.subscription = null;
		}
	}
}
