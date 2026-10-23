// The steps the library's own components use, for an app to line up with them

export const space = Object.freeze({ xs: '3px', sm: '6px', md: '12px', lg: '18px', xl: '24px' });

export const radius = Object.freeze({ sm: '4px', md: '6px', lg: '8px', pill: '999px' });

/** Media queries: a phone is under 768px wide; touch is a coarse pointer, whatever the width */
export const media = Object.freeze({
	phone: '(max-width: 767px)',
	wide: '(min-width: 768px)',
	touch: '(pointer: coarse)',
});

/** Shadows that lift what floats off the page: sm under a popover, menu or toast, lg under a dialog or sheet */
export const elevation = Object.freeze({
	sm: '0 4px 16px rgb(0 0 0 / 0.5)',
	lg: '0 8px 40px rgb(0 0 0 / 0.7)',
});

/**
 * The type scale, relative to the text around it: xs for counts, details and section labels, sm for chips, tags and
 * small headers, md the body, lg a bar's heading or an h3, xl an h2, xxl an h1
 */
export const fontSize = Object.freeze({
	xs: '0.75em',
	sm: '0.875em',
	md: '1em',
	lg: '1.125em',
	xl: '1.25em',
	xxl: '1.5em',
});

/** How long things take to move: fast for a hover or press, base for something opening, slow for what eases in behind */
export const duration = Object.freeze({ fast: '0.15s', base: '0.3s', slow: '0.6s' });

/** What a dialog, a toast or a button is about: each is a color role of the same name */
export const intents = Object.freeze(['info', 'success', 'warning', 'danger']);
