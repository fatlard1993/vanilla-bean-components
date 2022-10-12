import Label from '.';

context('Label', () => {
	it('must render', () => {
		cy.mount(new Label({ label: 'test' }));

		cy.get('.label').should('be.visible');
	});
});
