import { paths } from '../../demo/router/constants';

context('Popover', () => {
	before(() => {
		cy.visit(`#${paths.popover}`);
	});

	it('Exists', () => {
		cy.get('.popover').should('exist');
	});
});
