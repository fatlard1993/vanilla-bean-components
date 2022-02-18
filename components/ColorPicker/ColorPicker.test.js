import { paths } from '../../demo/router/constants';

context('ColorPicker', () => {
	before(() => {
		cy.visit(`#${paths.colorPicker}`);
	});

	it('Exists', () => {
		cy.get('.colorPicker').should('be.visible');
	});
});
