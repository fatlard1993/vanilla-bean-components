export const styled = (domElem, styles = () => '') => {
	return class StyledElem extends domElem {
		constructor({ styles: overlayStyles = () => '', ...options }) {
			super({
				styles: theme => `
					${styles(theme)}

					${overlayStyles(theme)}
				`,
				...options,
			});
		}
	};
};
