import ColorPicker from '.';

context('ColorPicker', () => {
	it('must render', () => {
		cy.mount(new ColorPicker({ label: 'ColorPicker' }).elem);

		cy.get('.colorPicker').should('be.visible');
	});
});
