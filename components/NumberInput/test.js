import NumberInput from '.';

context('NumberInput', () => {
	it('must render', () => {
		cy.mount(new NumberInput({}));

		cy.get('.numberInput').should('be.visible');
	});
});
