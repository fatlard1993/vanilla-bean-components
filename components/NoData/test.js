import NoData from '.';

context('NoData', () => {
	it('must render', () => {
		cy.mount(new NoData({ textContent: 'test' }));

		cy.get('.noData').should('be.visible');
	});
});
