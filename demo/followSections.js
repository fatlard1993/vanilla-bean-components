/**
 * The section a hash names in its query (`#/documentation/usage?section=forms`), which the router leaves alone.
 * @param {string} [hash] - A location hash
 * @returns {string|null} The section's heading id
 */
export const sectionOf = (hash = window.location.hash) => new URLSearchParams(hash.split('?')[1] ?? '').get('section');

/**
 * Lets rendered markdown's section links work under hash routing. A link within the page (`#open-questions`) would
 * otherwise change the route; it scrolls to its heading instead and records the section in the query, without a
 * hashchange that would re-render the view. The section the current hash names is scrolled to once the markdown is shown.
 * @param {HTMLElement} markdown - The element holding rendered markdown, its headings carrying ids
 * @param {AbortSignal} [signal] - Removes the listeners when aborted
 */
export const followSections = (markdown, signal) => {
	const scrollTo = id => {
		const heading = id && markdown.querySelector(`#${CSS.escape(id)}`);

		heading?.scrollIntoView({ block: 'start' });

		return heading;
	};

	markdown.addEventListener(
		'click',
		event => {
			const href = event.target.closest?.('a')?.getAttribute('href');

			if (!href?.startsWith('#') || href.startsWith('#/')) return;
			if (!scrollTo(decodeURIComponent(href.slice(1)))) return;

			event.preventDefault();
			window.history.replaceState(null, '', `${window.location.hash.split('?')[0]}?section=${href.slice(1)}`);
		},
		{ signal },
	);

	// A view builds its markdown before it is in the page, where scrolling does nothing
	const scrollOnceShown = () => {
		if (signal?.aborted) return;
		if (markdown.isConnected) scrollTo(sectionOf());
		else requestAnimationFrame(scrollOnceShown);
	};

	scrollOnceShown();

	// The router keeps the view when only the query changes, so a new section in the hash is followed here
	window.addEventListener('hashchange', () => scrollTo(sectionOf()), { signal });
};
