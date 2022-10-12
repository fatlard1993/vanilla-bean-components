import DomElem from '.';

context('DomElem', () => {
	it('must render', () => {
		cy.mount(new DomElem('p', { textContent: 'test' }));

		cy.findByText('test').should('be.visible');
	});
});
