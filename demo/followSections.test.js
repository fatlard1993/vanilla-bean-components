import { afterEach, describe, expect, mock, test } from 'bun:test';

import { followSections, sectionOf } from './followSections';

const markdown = () => {
	const elem = document.createElement('div');

	elem.innerHTML = '<a href="#forms">Forms</a><a href="#/Button">Button</a><h2 id="forms">Forms</h2>';
	document.body.append(elem);

	return elem;
};

afterEach(() => {
	document.body.replaceChildren();
	window.location.hash = '';
});

describe('sectionOf', () => {
	test('reads the section from the query the router ignores', () => {
		expect(sectionOf('#/documentation/usage?section=forms')).toBe('forms');
		expect(sectionOf('#/documentation/usage')).toBeNull();
	});
});

describe('followSections', () => {
	test('a link within the page scrolls to its heading and keeps the route', () => {
		window.location.hash = '#/documentation/usage';
		const elem = markdown();
		const heading = elem.querySelector('h2');
		heading.scrollIntoView = mock();
		followSections(elem);

		const link = elem.querySelector('a[href="#forms"]');
		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		link.dispatchEvent(event);

		expect(heading.scrollIntoView).toHaveBeenCalled();
		expect(event.defaultPrevented).toBe(true);
		expect(window.location.hash).toBe('#/documentation/usage?section=forms');
	});

	test('a route link is left to the router', () => {
		const elem = markdown();
		followSections(elem);

		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		elem.querySelector('a[href="#/Button"]').dispatchEvent(event);

		expect(event.defaultPrevented).toBe(false);
	});

	test('the section the hash names is scrolled to on render', () => {
		window.location.hash = '#/documentation/usage?section=forms';
		const elem = markdown();
		const heading = elem.querySelector('h2');
		heading.scrollIntoView = mock();

		followSections(elem);

		expect(heading.scrollIntoView).toHaveBeenCalled();
	});

	test('markdown built before it is shown scrolls once it is in the page', async () => {
		window.location.hash = '#/documentation/usage?section=forms';
		const elem = markdown();
		elem.remove();
		const heading = elem.querySelector('h2');
		heading.scrollIntoView = mock();

		followSections(elem);
		expect(heading.scrollIntoView).not.toHaveBeenCalled();

		document.body.append(elem);
		await new Promise(resolve => requestAnimationFrame(resolve));
		await new Promise(resolve => requestAnimationFrame(resolve));

		expect(heading.scrollIntoView).toHaveBeenCalled();
	});

	test('a new section in the hash, on the same view, is scrolled to', () => {
		window.location.hash = '#/documentation/usage';
		const elem = markdown();
		const heading = elem.querySelector('h2');
		heading.scrollIntoView = mock();
		const controller = new AbortController();
		followSections(elem, controller.signal);

		window.location.hash = '#/documentation/usage?section=forms';
		window.dispatchEvent(new Event('hashchange'));
		expect(heading.scrollIntoView).toHaveBeenCalledTimes(1);

		controller.abort();
		window.dispatchEvent(new Event('hashchange'));
		expect(heading.scrollIntoView).toHaveBeenCalledTimes(1);
	});
});
