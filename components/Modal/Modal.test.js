import Modal from '.';

context('Modal', () => {
	it('must render', () => {
		cy.mount(new Modal({}));

		cy.get('.modal').should('be.visible');
	});
});
