import TextInput from '.';

context('TextInput', () => {
	it('must render', () => {
		cy.mount(new TextInput({}));

		cy.get('.textInput').should('be.visible');
	});
});
