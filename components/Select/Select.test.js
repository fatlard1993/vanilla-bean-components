import { paths } from '../../demo/router/constants';

context('Select', () => {
	before(() => {
		cy.visit(`#${paths.select}`);
	});

	it('Exists', () => {
		cy.get('.select').should('be.visible');
	});
});
