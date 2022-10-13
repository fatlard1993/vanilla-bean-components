import Select from '.';

context('Select', () => {
	it('must render', () => {
		cy.mount(new Select({ options: ['test'] }));

		cy.get('.select').should('be.visible');
	});
});
