describe('Navigation', () => {
    it('should navigate to the new shader page', () => {
        cy.visit('http://localhost:3000/');
        cy.get('a[href="/new"]').click();
        cy.url().should('include', '/new');
        cy.get('h6').contains('New Shader');
        cy.get('span').contains('FPS');
    });
});
