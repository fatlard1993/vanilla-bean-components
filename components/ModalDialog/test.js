import ModalDialog from '.';

context('ModalDialog', () => {
	it('must render', () => {
		cy.mount(new ModalDialog({}).modal);

		cy.get('.modal').should('be.visible');
		cy.get('.dialog').should('be.visible');
	});
});
