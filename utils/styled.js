export const styled = (domElem, styles = () => '') => {
	return class StyledElem extends domElem {
		constructor({ styles: overlayStyles = () => '', ...options }) {
			super({
				styles: theme => `
					margin: 6px;
					flex: 1;

					${styles(theme)}

					${overlayStyles(theme)}
				`,
				...options,
			});
		}
	};
};
