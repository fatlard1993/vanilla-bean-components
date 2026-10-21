// The steps the library's own components use, for an app to line up with them

export const space = Object.freeze({ xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' });

export const radius = Object.freeze({ sm: '4px', md: '6px', lg: '8px', pill: '999px' });

/** Media queries: a phone is under 768px wide; touch is a coarse pointer, whatever the width */
export const media = Object.freeze({
	phone: '(max-width: 767px)',
	wide: '(min-width: 768px)',
	touch: '(pointer: coarse)',
});
