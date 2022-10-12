import '@testing-library/cypress/add-commands';

Cypress.Commands.add('mount', elem => {
	document.getElementById('root').appendChild(elem);
});
