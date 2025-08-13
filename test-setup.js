/// <reference lib="dom" />

import { beforeEach, mock, spyOn, expect, setSystemTime } from 'bun:test';

import * as matchers from '@testing-library/jest-dom/matchers';

import { GlobalRegistrator } from '@happy-dom/global-registrator';

// expose globals
// - some weren't available otherwise and importing in the test files breaks the rest of the file
global.mock = mock;
global.spyOn = spyOn;
global.setSystemTime = setSystemTime;

GlobalRegistrator.register({ width: 1920, height: 1080 });

// Expose EventTarget for Context
global.EventTarget = (await import('happy-dom')).EventTarget;

expect.extend(matchers);

// happy dom doesn't support popovers yet
HTMLElement.prototype.showPopover = function () {
	this.style.display = 'block';
};
HTMLElement.prototype.hidePopover = function () {
	this.style.display = 'none';
};

// happy dom doesn't support dialogs yet
HTMLDialogElement.prototype.show = function () {
	this.open = true;
	this.style.display = 'block';
};
HTMLDialogElement.prototype.showModal = function () {
	this.open = true;
	this.style.display = 'block';
};
HTMLDialogElement.prototype.close = function () {
	this.open = false;
	this.style.display = 'none';
};

// happy dom doesn't support canvas yet
HTMLCanvasElement.prototype.getContext = function () {
	return {
		closePath: () => {},
		lineTo: () => {},
		clearRect: () => {},
	};
};

// happy dom doesn't support XPathResult yet
global.XPathResult = {
	ANY_TYPE: 0,
	NUMBER_TYPE: 1,
	STRING_TYPE: 2,
	BOOLEAN_TYPE: 3,
	UNORDERED_NODE_ITERATOR_TYPE: 4,
	ORDERED_NODE_ITERATOR_TYPE: 5,
	UNORDERED_NODE_SNAPSHOT_TYPE: 6,
	ORDERED_NODE_SNAPSHOT_TYPE: 7,
	ANY_UNORDERED_NODE_TYPE: 8,
	FIRST_ORDERED_NODE_TYPE: 9,
};

// happy dom doesn't support document.evaluate yet
document.evaluate = function (xPath, contextNode) {
	// Mock implementation for getElementsContainingText
	const elements = [];

	// Extract element selector from XPath (e.g., ".//*" or ".//p")
	const elementMatch = xPath.match(/\/\/([^[]+)/);
	const elementSelector = elementMatch ? elementMatch[1] : '*';

	// Simple text search implementation for testing
	if (xPath.includes('contains(') && xPath.includes('translate(')) {
		// Case insensitive search
		const textMatch = xPath.match(/'([^']+)'/g);
		if (textMatch && textMatch.length > 0) {
			const searchText = textMatch[textMatch.length - 1].slice(1, -1); // Remove quotes
			const selector = elementSelector === '*' ? '*' : elementSelector;
			const allElements = Array.from((contextNode || document).querySelectorAll(selector));

			for (const element of allElements) {
				if (element.textContent && element.textContent.toLowerCase().includes(searchText.toLowerCase())) {
					elements.push(element);
				}
			}
		}
	} else if (xPath.includes('contains(') && xPath.includes('text(),')) {
		// Case sensitive search
		const match = xPath.match(/text\(\),'([^']+)'/);
		if (match) {
			const searchText = match[1];
			const selector = elementSelector === '*' ? '*' : elementSelector;
			const allElements = Array.from((contextNode || document).querySelectorAll(selector));

			for (const element of allElements) {
				if (element.textContent && element.textContent.includes(searchText)) {
					elements.push(element);
				}
			}
		}
	}

	let currentIndex = 0;
	return {
		iterateNext: () => {
			return currentIndex < elements.length ? elements[currentIndex++] : null;
		},
		snapshotLength: elements.length,
		snapshotItem: index => {
			return index < elements.length ? elements[index] : null;
		},
	};
};

global.container = document.body;

beforeEach(() => {
	mock.restore();
	document.body.replaceChildren();
});
