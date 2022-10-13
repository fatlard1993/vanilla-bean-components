import IconButton from '.';

context('IconButton', () => {
	it('must render', () => {
		cy.mount(new IconButton({ icon: 'test' }));

		cy.get('.iconButton').should('be.visible');
	});
});
