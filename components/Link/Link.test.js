import Link from '.';

context('Link', () => {
	it('must render', () => {
		cy.mount(new Link({ textContent: 'test' }));

		cy.get('.link').should('be.visible');
	});
});
