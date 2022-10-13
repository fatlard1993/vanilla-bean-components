import Button from '.';

context('Button', () => {
	it('must render', () => {
		cy.mount(new Button({ textContent: 'test' }));

		cy.findByRole('button').should('be.visible');
	});
});
