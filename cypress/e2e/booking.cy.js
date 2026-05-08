describe('Booking Flow', () => {
  beforeEach(() => {
    // Login as a user first (using a stable test user)
    cy.visit('/login.html');
    cy.get('#email').type('test@test.com');
    cy.get('#password').type('123456');
    cy.get('#role').select('user');
    cy.get('#loginBtn').click();
    cy.url().should('include', 'main.html');
  });

  it('should navigate to services and view details', () => {
    cy.visit('/services.html');
    cy.get('.service-card').should('have.length.at.least', 1);
    cy.get('.service-card').first().find('.btn-outline').click();
    cy.get('.modal').should('be.visible');
    cy.get('.modal-body').should('not.be.empty');
  });

  it('should prevent booking if fields are empty', () => {
    cy.visit('/booking.html');
    cy.get('button[type="submit"]').click();
    // HTML5 validation might prevent submission, or we check for error messages
    cy.url().should('include', 'booking.html');
  });

  it('should navigate to booking from services', () => {
    cy.visit('/services.html');
    cy.get('.service-card').first().find('.btn-primary').click();
    cy.url().should('include', 'booking.html');
  });

  it('should fill the booking form', () => {
    cy.visit('/booking.html');
    cy.get('#service-type').select('Electrician');
    cy.get('#customer-name').type('Cypress Tester');
    cy.get('#phone').type('9876543210');
    cy.get('#booking-date').type('2026-12-31');
    cy.get('#address').type('123 Test Lane, Cypress City');
    
    // Check if normal/emergency toggle works
    cy.get('.toggle-btn').contains('Emergency').click();
    cy.get('.toggle-btn').contains('Emergency').should('have.class', 'active');
  });
});
