import { paths } from '../../demo/router/constants';

context('TextInput', () => {
	before(() => {
		cy.visit(`#${paths.textInput}`);
	});

	it('Exists', () => {
		cy.get('.textInput').should('be.visible');
	});
});
