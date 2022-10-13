import Dialog from '.';

context('Dialog', () => {
	it('must render', () => {
		cy.mount(new Dialog({ header: 'test' }));

		cy.get('.dialog').should('be.visible');
	});
});
