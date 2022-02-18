import { paths } from '../../demo/router/constants';

context('Dialog', () => {
	before(() => {
		cy.visit(`#${paths.dialog}`);
	});

	it('Exists', () => {
		cy.get('.dialog').should('be.visible');
	});
});
