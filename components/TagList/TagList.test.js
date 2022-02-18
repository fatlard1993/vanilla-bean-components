import { paths } from '../../demo/router/constants';

context('TagList', () => {
	before(() => {
		cy.visit(`#${paths.tagList}`);
	});

	it('Exists', () => {
		cy.get('.tagList').should('be.visible');
	});
});
