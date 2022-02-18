import { paths } from '../../demo/router/constants';

context('NoData', () => {
	before(() => {
		cy.visit(`#${paths.noData}`);
	});

	it('Exists', () => {
		cy.get('.noData').should('be.visible');
	});
});
