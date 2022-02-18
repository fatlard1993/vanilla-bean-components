import { paths } from '../../demo/router/constants';

context('NumberInput', () => {
	before(() => {
		cy.visit(`#${paths.numberInput}`);
	});

	it('Exists', () => {
		cy.get('.numberInput').should('be.visible');
	});
});
