import { paths } from '../../demo/router/constants';

context('Textarea', () => {
	before(() => {
		cy.visit(`#${paths.textarea}`);
	});

	it('Exists', () => {
		cy.get('.textarea').should('be.visible');
	});
});
