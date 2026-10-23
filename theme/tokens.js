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
