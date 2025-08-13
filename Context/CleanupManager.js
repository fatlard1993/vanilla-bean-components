import ErrorHandler from './ErrorHandler.js';

/**
 * Centralized cleanup management with error isolation.
 * Handles resource cleanup with automatic error handling.
 */
export default class CleanupManager {
	constructor() {
		this.cleanupTasks = [];
		this.isDestroyed = false;
	}

	/**
	 * Register a cleanup task.
	 * @param {Function} cleanupFn - Function to call during cleanup
	 * @param {string} [description] - Description for debugging
	 * @returns {Function} deregister function to remove this cleanup task
	 */
	add(cleanupFn, description = 'cleanup') {
		if (this.isDestroyed) return () => {};

		const task = { fn: cleanupFn, description };
		this.cleanupTasks.push(task);

		return () => {
			const index = this.cleanupTasks.indexOf(task);
			if (index >= 0) this.cleanupTasks.splice(index, 1);
		};
	}

	/**
	 * Execute all cleanup tasks and mark as destroyed.
	 */
	destroy() {
		if (this.isDestroyed) return;
		this.isDestroyed = true;

		this.cleanupTasks.forEach(({ fn, description }) => {
			try {
				fn();
			} catch (error) {
				ErrorHandler.handleWarning(`Cleanup error (${description}): ${error.message}`);
			}
		});

		this.cleanupTasks.length = 0;
	}

	/**
	 * Get the number of registered cleanup tasks.
	 * @returns {number} Number of cleanup tasks
	 */
	get size() {
		return this.cleanupTasks.length;
	}
}
