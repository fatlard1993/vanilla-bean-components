import Textarea from '.';

context('Textarea', () => {
	it('must render', () => {
		cy.mount(new Textarea({}));

		cy.get('.textarea').should('be.visible');
	});
});
