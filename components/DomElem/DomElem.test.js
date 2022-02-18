import { paths } from '../../demo/router/constants';

context('DomElem', () => {
	before(() => {
		cy.visit(`#${paths.domElem}`);
	});

	it('Exists', () => {
		cy.get('.domElem').should('be.visible');
	});
});
