import TagList from '.';

context('TagList', () => {
	it('must render', () => {
		cy.mount(new TagList({}));

		cy.get('.tagList').should('be.visible');
	});
});
