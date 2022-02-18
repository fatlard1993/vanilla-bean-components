import { paths } from '../../demo/router/constants';

context('Label', () => {
	before(() => {
		cy.visit(`#${paths.label}`);
	});

	it('Exists', () => {
		cy.get('.label').should('be.visible');
	});
});
