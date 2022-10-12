import Tag from '.';

context('Tag', () => {
	it('must render', () => {
		cy.mount(new Tag({}));

		cy.get('.tag').should('be.visible');
	});
});
