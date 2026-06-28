import { styled } from '../../styled';
import { Component } from '../../Component';
import { Elem } from '../../Elem';

const defaultOptions = {
	get appendTo() {
		return document.body;
	},
};

/**
 * Mobile-friendly bottom sheet with drag-to-close gesture.
 *
 * Mounts to document.body by default. Call show() to slide up, hide() to dismiss.
 * Drag the handle downward past the threshold to dismiss.
 * @param {object} [options={}] - BottomSheet configuration options
 * @param {Function} [options.onClose] - Called when the sheet is dismissed
 * @param {...(Component|HTMLElement|string)} children - Appended to the sheet body
 */
class BottomSheet extends styled(
	Component,
	({ colors }) => `
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		background: ${colors.darker(colors.gray)};
		border-top: 1px solid ${colors.dark(colors.gray)};
		max-height: 85vh;
		z-index: 1000;
		transform: translateY(100%);
		transition: transform 0.3s ease;

		&.open {
			transform: translateY(0);
		}

		& .sheet-drag-zone {
			flex-shrink: 0;
			height: 32px;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: grab;
			touch-action: none;
			user-select: none;

			&:active { cursor: grabbing; }

			& .sheet-handle {
				width: 40px;
				height: 4px;
				border-radius: 3px;
				background: rgba(255,255,255,0.2);
				pointer-events: none;
			}
		}

		& .sheet-body {
			flex: 1;
			overflow-y: auto;
			overscroll-behavior: contain;
		}
	`,
) {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	// Empty handler prevents _standardSetOption from routing onClose through the event system.
	// The value is accessed directly as this.options.onClose in hide().
	static handlers = {
		onClose() {},
	};

	constructor(options = {}, ...children) {
		super({ ...defaultOptions, ...options }, ...children);
	}

	build() {
		this._dragZone = new Elem({ tag: 'div', appendTo: this, addClass: 'sheet-drag-zone' });
		new Elem({ tag: 'div', appendTo: this._dragZone, addClass: 'sheet-handle' });

		this._body = new Component({ appendTo: this, addClass: 'sheet-body' });

		this._initDragToClose();
	}

	/**
	 * Content area for child components. Append children here for scrollable content.
	 * @returns {Component} The sheet body component
	 */
	get body() {
		return this._body;
	}

	/**
	 * Slides the sheet into view and registers navigation listeners to auto-dismiss.
	 */
	show() {
		this.addClass('open');
		if (!this._hideOnNavigate) {
			this._hideOnNavigate = () => this.hide();
			window.addEventListener('hashchange', this._hideOnNavigate, { once: true });
			window.addEventListener('popstate', this._hideOnNavigate, { once: true });
			this.replaceDestroyCleanup('hideOnNavigate', () => {
				window.removeEventListener('hashchange', this._hideOnNavigate);
				window.removeEventListener('popstate', this._hideOnNavigate);
				this._hideOnNavigate = null;
			});
		}
	}

	/**
	 * Slides the sheet out of view and calls onClose if set.
	 */
	hide() {
		this.removeClass('open');
		if (this._hideOnNavigate) {
			window.removeEventListener('hashchange', this._hideOnNavigate);
			window.removeEventListener('popstate', this._hideOnNavigate);
			this._hideOnNavigate = null;
			this.replaceDestroyCleanup('hideOnNavigate', () => {});
		}
		this.options.onClose?.();
	}

	_initDragToClose() {
		const el = this.elem;
		const dragZone = this._dragZone.elem;
		let startY = 0;

		// Mouse drag
		const onMouseMove = e => {
			const dy = e.clientY - startY;
			if (dy <= 0) return;
			el.style.transition = 'none';
			el.style.transform = `translateY(${dy}px)`;
		};

		const onMouseUp = e => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
			el.style.transition = '';
			el.style.transform = '';
			const dy = e.clientY - startY;
			if (dy > Math.min(100, el.offsetHeight * 0.25)) this.hide();
		};

		const onMouseDown = e => {
			startY = e.clientY;
			window.addEventListener('mousemove', onMouseMove);
			window.addEventListener('mouseup', onMouseUp);
		};

		// Touch drag
		const onTouchMove = e => {
			const dy = e.touches[0].clientY - startY;
			if (dy <= 0) return;
			e.preventDefault();
			el.style.transition = 'none';
			el.style.transform = `translateY(${dy}px)`;
		};

		const onTouchEnd = e => {
			el.style.transition = '';
			el.style.transform = '';
			const dy = e.changedTouches[0].clientY - startY;
			if (dy > Math.min(100, el.offsetHeight * 0.25)) this.hide();
		};

		const onTouchStart = e => {
			startY = e.touches[0].clientY;
		};

		dragZone.addEventListener('mousedown', onMouseDown);
		dragZone.addEventListener('touchstart', onTouchStart, { passive: true });
		dragZone.addEventListener('touchmove', onTouchMove, { passive: false });
		dragZone.addEventListener('touchend', onTouchEnd, { passive: true });

		this.replaceCleanup('dragToClose', () => {
			dragZone.removeEventListener('mousedown', onMouseDown);
			dragZone.removeEventListener('touchstart', onTouchStart);
			dragZone.removeEventListener('touchmove', onTouchMove);
			dragZone.removeEventListener('touchend', onTouchEnd);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		});
	}
}

export default BottomSheet;
