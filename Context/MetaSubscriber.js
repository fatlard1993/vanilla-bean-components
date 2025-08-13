import { debounce } from '../utils/data.js';
import BaseSubscriber from './BaseSubscriber.js';
import ErrorHandler from './ErrorHandler.js';
import CleanupManager from './CleanupManager.js';

const metaSubscriberKeys = [
	'__isMetaSubscriber',
	'__isSubscriber',
	'targets',
	'combiner',
	'subscribe',
	'unsubscribe',
	'destroy',
	'toJSON',
	'subscriptions',
	'subscriberCallbacks',
	'isDestroyed',
	'notifySubscribers',
	'getCurrentValue',
];

/**
 * Reactive subscriber combining values from one or more Context properties.
 * Proxy provides transparent access to combined result.
 * Supports debouncing for performance with rapid changes.
 * Automatic cleanup prevents memory leaks on destroy.
 * @augments BaseSubscriber
 * @example
 * const fullName = new MetaSubscriber(
 *   {context: userContext, key: 'firstName'},
 *   {context: userContext, key: 'lastName'},
 *   (first, last) => `${first} ${last}`
 * );
 * fullName.length; // String property access
 * fullName.subscribe(callback); // Subscribe to changes
 * fullName.destroy(); // Clean up all resources
 */
export default class MetaSubscriber extends BaseSubscriber {
	__isMetaSubscriber = true;

	/**
	 * Create multi-property reactive subscriber.
	 * Arguments parsed as: targets..., combiner?, options?
	 * @param {...object|Function} args - Target configs, combiner function, and options
	 * @param {import ('./Context.js')} args.context - Context instance to watch
	 * @param {string} args.key - Property key to watch
	 * @param {Function} [args.parser] - Transform function for this target's value
	 * @param {Function} [args.combiner] - Combines all target values (defaults to array)
	 * @param {object} [args.options] - Configuration options
	 * @param {number} [args.options.debounceMs] - Debounce update notifications
	 * @returns {Proxy} Proxy providing combiner result + subscriber methods
	 * @throws {TypeError} When targets/combiner/options are invalid
	 */
	constructor(...args) {
		super();

		this.cleanup = new CleanupManager();
		const { targets, combiner, options } = this.parseArguments(args);

		this.targets = targets;
		this.combiner = combiner || ((...values) => values);
		this.debounceMs = options.debounceMs || 0;

		this.currentValues = new Array(targets.length).fill(null);
		this.subscriptions = [];

		this.initializeValues();
		this.setupUpdates();
		this.setupSubscriptions();

		this.proxy = this.createProxy(metaSubscriberKeys);
		return this.proxy;
	}

	/**
	 * Is this subscriber destroyed.
	 * @returns {boolean} True if destroyed
	 */
	get isDestroyed() {
		return this.cleanup.isDestroyed;
	}

	/**
	 * Parse constructor arguments into targets, combiner, and options.
	 * @param {Array} args - Constructor arguments
	 * @returns {{targets: object[], combiner: Function|null, options: object}} Parsed arguments
	 * @private
	 */
	parseArguments(args) {
		const targets = [];
		let combiner = null;
		let options = {};

		for (let i = 0; i < args.length; i++) {
			const arg = args[i];

			if (typeof arg === 'function' && combiner === null) {
				combiner = arg;
			} else if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
				if (arg.context && typeof arg.key === 'string') {
					targets.push(arg);
				} else if (combiner !== null) {
					options = arg;
					break;
				}
			}
		}

		this.validateArguments(targets, combiner, options);
		return { targets, combiner, options };
	}

	/**
	 * Validates parsed constructor arguments.
	 * @param {object[]} targets - Target configurations
	 * @param {Function|null} combiner - Combiner function
	 * @param {object} options - Options object
	 * @throws {TypeError} When arguments are invalid
	 * @private
	 */
	validateArguments(targets, combiner, options) {
		if (targets.length === 0) {
			ErrorHandler.handleValidationError(
				'MetaSubscriber requires at least one watch target',
				'no targets',
				'at least one target',
			);
		}

		targets.forEach((target, index) => {
			if (!target.context || typeof target.context !== 'object') {
				ErrorHandler.handleValidationError(
					`Target ${index} context must be a Context instance`,
					target.context === null ? 'null' : typeof target.context,
					'Context instance',
				);
			}

			if (typeof target.key !== 'string') {
				ErrorHandler.handleValidationError(`Target ${index} key must be a string`, typeof target.key, 'string');
			}

			if (target.context.isDestroyed) {
				ErrorHandler.handleValidationError(
					`Target ${index} context is destroyed`,
					'destroyed context',
					'active context',
				);
			}

			if (target.parser && typeof target.parser !== 'function') {
				ErrorHandler.handleValidationError(
					`Target ${index} parser must be a function`,
					typeof target.parser,
					'function',
				);
			}
		});

		if (combiner && typeof combiner !== 'function') {
			ErrorHandler.handleValidationError('MetaSubscriber combiner must be a function', typeof combiner, 'function');
		}

		const { debounceMs = 0 } = options;
		if (typeof debounceMs !== 'number' || debounceMs < 0) {
			ErrorHandler.handleValidationError(
				'MetaSubscriber debounceMs must be a non-negative number',
				typeof debounceMs,
				'non-negative number',
			);
		}
	}

	/**
	 * Initialize current values from all targets.
	 * @private
	 */
	initializeValues() {
		this.targets.forEach((target, index) => {
			try {
				const rawValue = target.context.proxy[target.key];
				this.currentValues[index] = target.parser ? target.parser(rawValue) : rawValue;
			} catch (error) {
				ErrorHandler.handleParserError(error, target.context, target.key, 'meta-subscriber-init');
				this.currentValues[index] = null;
			}
		});
	}

	/**
	 * Set up debounced update mechanism.
	 * @private
	 */
	setupUpdates() {
		const updateSubscribers = () => {
			try {
				const combinedValue = this.getCurrentValue();
				this.notifySubscribers(combinedValue);
			} catch (error) {
				ErrorHandler.handleParserError(error, this, 'combiner', 'meta-subscriber-update');
				this.notifySubscribers(null);
			}
		};

		this.debouncedUpdate = this.debounceMs > 0 ? debounce(updateSubscribers, this.debounceMs) : updateSubscribers;
	}

	/**
	 * Subscribe to all target properties.
	 * @private
	 */
	setupSubscriptions() {
		this.targets.forEach((target, index) => {
			try {
				const subscription = target.context.subscribe({
					key: target.key,
					callback: value => this.handleTargetUpdate(index, target, value),
					parser: target.parser || (v => v),
				});

				this.cleanup.add(subscription.unsubscribe, `target-${index}-${target.key}`);
				this.subscriptions.push(subscription);
			} catch (error) {
				ErrorHandler.handleSubscriptionSetupError(error, target.key, target.context.constructor.name);
			}
		});
	}

	/**
	 * Handle update from a target property.
	 * @param {number} index - Target index
	 * @param {object} target - Target configuration
	 * @param {*} value - New value
	 * @private
	 */
	handleTargetUpdate(index, target, value) {
		if (this.isDestroyed) return;

		try {
			this.currentValues[index] = target.parser ? target.parser(value) : value;
		} catch (error) {
			ErrorHandler.handleParserError(error, target.context, target.key, 'meta-subscriber-update');
			this.currentValues[index] = null;
		}

		this.debouncedUpdate();
	}

	/**
	 * Get current combined value from all targets.
	 * @returns {*} Result of combiner function with current values
	 * @override
	 */
	getCurrentValue() {
		return this.combiner(...this.currentValues);
	}

	/**
	 * Clean up all subscriptions and mark as destroyed.
	 * Removes all target subscriptions automatically.
	 * @override
	 */
	destroy() {
		super.destroy();
		this.cleanup.destroy();
		this.subscriptions = [];
	}
}
