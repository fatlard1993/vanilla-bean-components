import { paths } from '../../demo/router/constants';

context('Link', () => {
	before(() => {
		cy.visit(`#${paths.link}`);
	});

	it('Exists', () => {
		cy.get('.link').should('be.visible');
	});
});
