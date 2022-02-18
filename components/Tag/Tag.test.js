import { paths } from '../../demo/router/constants';

context('Tag', () => {
	before(() => {
		cy.visit(`#${paths.tag}`);
	});

	it('Exists', () => {
		cy.get('.tag').should('be.visible');
	});
});
