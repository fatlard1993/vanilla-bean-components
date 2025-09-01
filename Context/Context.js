import { nanoid } from 'nanoid';

import Subscriber from './Subscriber';
import ErrorHandler from './ErrorHandler';
import CleanupManager from './CleanupManager';

/**
 * Reactive state container with proxy-based property access and automatic event emission.
 * Constructor returns proxy enabling direct property access alongside Context methods.
 * @augments EventTarget
 */
export default class Context extends EventTarget {
	/**
	 * Creates reactive state container with proxy-based property access.
	 * @param {object} initialState - Plain object containing initial state properties
	 * @returns {Proxy} Proxy object enabling direct property access and Context method calls
	 * @throws {TypeError} When initialState is null, undefined, array, or non-object type
	 */
	constructor(initialState) {
		super();

		if (
			initialState === null ||
			initialState === undefined ||
			typeof initialState !== 'object' ||
			Array.isArray(initialState)
		) {
			const receivedType = (value => {
				if (value === null) return 'null';
				if (value === undefined) return 'undefined';
				if (Array.isArray(value)) return 'array';
				return typeof value;
			})(initialState);

			ErrorHandler.handleValidationError(
				'Context requires a plain object as initial state',
				receivedType,
				'plain object',
			);
		}

		const context = this;
		this.cleanup = new CleanupManager();
		this.subscriptions = {};

		try {
			this.target = Object.fromEntries(
				Object.entries(initialState).map(([key, value]) => {
					if (value?.__isSubscriber) {
						try {
							const { unsubscribe } = value.subscribe(_value => {
								if (!this.cleanup.isDestroyed) {
									this.proxy[key] = _value;
								}
							});
							this.cleanup.add(unsubscribe, `subscriber-${key}`);
							value = value.toJSON();
						} catch (error) {
							ErrorHandler.handleParserError(error, this, key, 'subscriber-initialization');
							value = null;
						}
					}

					return [key, value];
				}),
			);
		} catch (error) {
			ErrorHandler.handleInitializationError(error, initialState);
			throw error;
		}

		this.proxy = new Proxy(this.target, {
			get(target, key) {
				if (context[key] !== undefined) {
					const value = context[key];
					if (typeof value === 'function') {
						if (!context._boundMethods) context._boundMethods = new Map();
						if (!context._boundMethods.has(key)) {
							context._boundMethods.set(key, value.bind(context));
						}
						return context._boundMethods.get(key);
					}
					return value;
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

	/**
	 * Is this context destroyed.
	 * @returns {boolean} True if destroyed
	 */
	get isDestroyed() {
		return this.cleanup.isDestroyed;
	}

	/**
	 * Add event listener with automatic cleanup tracking.
	 * @param {string} type - Event type
	 * @param {Function} listener - Event handler
	 * @param {boolean|object} [options] - Event listener options
	 */
	addEventListener(type, listener, options) {
		if (this.isDestroyed) {
			ErrorHandler.handleWarning('Cannot add event listener to destroyed context');
			return;
		}

		super.addEventListener(type, listener, options);

		// Auto-register cleanup
		this.cleanup.add(() => {
			super.removeEventListener(type, listener, options);
		}, `listener-${type}`);
	}

	/**
	 * Remove event listener (cleanup is automatic).
	 * @param {string} type - Event type
	 * @param {Function} listener - Event handler
	 * @param {boolean|object} [options] - Event listener options
	 */
	removeEventListener(type, listener, options) {
		super.removeEventListener(type, listener, options);
	}

	/**
	 * Processes property changes and dispatches corresponding events.
	 *
	 * Dispatches generic 'set' event containing key and value, followed by
	 * property-specific event with value as detail.
	 * @param {string|symbol} key - Property name that was modified
	 * @param {*} value - New value assigned to the property
	 * @param {boolean} result - Whether the proxy set operation succeeded
	 * @private
	 */
	onSet(key, value, result) {
		if (!result) {
			ErrorHandler.handleSetError(key, value);
			return;
		}

		if (this.isDestroyed) {
			return;
		}

		try {
			this.dispatchEvent(new CustomEvent('set', { detail: { key, value } }));
			this.dispatchEvent(new CustomEvent(String(key), { detail: value }));
		} catch (error) {
			ErrorHandler.handleEventDispatchError(error, key, value);
		}
	}

	/**
	 * Creates reactive subscriber that tracks a specific property with optional transformation.
	 * @param {string} key - Property name to subscribe to
	 * @param {Function} [parser] - Transform function applied to property value before delivery
	 * @returns {Subscriber|null} Subscriber instance with proxy behavior, null if context destroyed
	 */
	subscriber(key, parser) {
		if (this.isDestroyed) {
			ErrorHandler.handleWarning('Cannot create subscriber on destroyed context');
			return null;
		}

		try {
			return new Subscriber({ key, parser, context: this });
		} catch (error) {
			ErrorHandler.handleSubscriptionSetupError(error, key, this.constructor.name);
			return null;
		}
	}

	/**
	 * Subscribes to property changes with manual subscription management.
	 * @param {object} config - Subscription configuration
	 * @param {string} config.key - Property name to watch for changes
	 * @param {Function} config.callback - Handler invoked with parsed value when property changes
	 * @param {Function} [config.parser] - Transform function applied to property value before callback
	 * @returns {{unsubscribe: Function, current: *, id: string}} Subscription control object
	 * @throws {TypeError} When callback is not a function or key is not a string
	 */
	subscribe({ callback, key, parser = _ => _ }) {
		if (typeof callback !== 'function') {
			ErrorHandler.handleValidationError('Subscribe callback must be a function', typeof callback, 'function');
		}

		if (typeof key !== 'string') {
			ErrorHandler.handleValidationError('Subscribe key must be a string', typeof key, 'string');
		}

		if (parser !== null && parser !== undefined && typeof parser !== 'function') {
			ErrorHandler.handleValidationError('Subscribe parser must be a function', typeof parser, 'function');
		}

		if (this.isDestroyed) {
			return this.createDestroyedSubscription(key);
		}

		const id = nanoid();
		const subscription = ({ detail }) => {
			try {
				callback(parser(detail));
			} catch (error) {
				ErrorHandler.handleParserError(error, this, key, 'subscription');
				try {
					callback(null);
				} catch (callbackError) {
					ErrorHandler.handleWarning(`Subscription callback failed after parser error: ${callbackError.message}`);
				}
			}
		};

		subscription.key = key;
		this.subscriptions[id] = subscription;

		try {
			this.addEventListener(String(key), subscription);
		} catch (error) {
			delete this.subscriptions[id];
			ErrorHandler.handleSubscriptionSetupError(error, key, this.constructor.name);
			return {
				unsubscribe: () => ErrorHandler.handleWarning('Unsubscribe called on failed subscription'),
				current: null,
				id: null,
				isDestroyed: true,
			};
		}

		const unsubscribe = () => {
			if (this.subscriptions[id]) {
				this.removeEventListener(String(key), subscription);
				delete this.subscriptions[id];
			}
		};

		this.cleanup.add(unsubscribe, `subscription-${key}`);

		return {
			unsubscribe,
			current: this.getInitialValue(key, parser),
			id,
		};
	}

	/**
	 * Remove subscription by ID.
	 * @param {string} id - Subscription ID from subscribe()
	 */
	unsubscribe(id) {
		if (!id || !this.subscriptions[id]) {
			if (id) {
				ErrorHandler.handleWarning(`Attempted to unsubscribe non-existent subscription: ${id}`);
			}
			return;
		}

		try {
			const subscription = this.subscriptions[id];
			const { key } = subscription;
			this.removeEventListener(key, subscription);
			delete this.subscriptions[id];
		} catch (error) {
			ErrorHandler.handleUnsubscribeError(error, id, this.constructor.name);
			delete this.subscriptions[id];
		}
	}

	createDestroyedSubscription(key) {
		return {
			unsubscribe: () => ErrorHandler.handleWarning('Unsubscribe called on destroyed context subscription'),
			current: this.target?.[key] ?? null,
			id: null,
			isDestroyed: true,
		};
	}

	getInitialValue(key, parser) {
		try {
			return parser(this.proxy[key]);
		} catch (error) {
			ErrorHandler.handleParserError(error, this, key, 'initial-subscription');
			return null;
		}
	}

	/**
	 * Destroys context and cleans up all associated resources.
	 *
	 * Removes all subscriptions, event listeners, and cross-context connections.
	 * Prevents further property modifications and subscription creation.
	 */
	destroy() {
		if (this._boundMethods) {
			this._boundMethods.clear();
			this._boundMethods = null;
		}

		this.cleanup.destroy();
		this.subscriptions = {};
	}

	[Symbol.dispose]() {
		this.destroy();
	}
}
