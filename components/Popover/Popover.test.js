import Popover from '.';

context('Popover', () => {
	it('must render', () => {
		cy.mount(new Popover({}));

		cy.get('.popover').should('exist');
	});
});
