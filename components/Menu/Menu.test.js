import Menu from '.';

context('Menu', () => {
	it('must render', () => {
		cy.mount(new Menu({}));

		cy.get('.menu').should('exist');
	});
});
