describe('Authentication Flow', () => {
  const randomEmail = `testuser_${Math.floor(Math.random() * 10000)}@example.com`;

  beforeEach(() => {
    cy.visit('/main.html');
  });

  it('should navigate to login page', () => {
    cy.get('a[href*="login.html"]').first().click();
    cy.url().should('include', 'login.html');
    cy.get('h1').should('contain', 'User Login');
  });

  it('should register a new user successfully', () => {
    cy.visit('/signup.html');
    cy.get('#fullname').type('Test User');
    cy.get('#email').type(randomEmail);
    cy.get('#password').type('password123');
    cy.get('#location').type('Test City');
    cy.get('#role').select('user');
    cy.get('#security-question').select('What is your favorite color?');
    cy.get('#security-answer').type('Blue');
    
    cy.get('#signupBtn').click();
    
    // Should be redirected to login or main after registration
    cy.url().should('match', /login\.html|main\.html/);
  });

  it('should login with new credentials', () => {
    cy.visit('/login.html');
    cy.get('#email').type(randomEmail);
    cy.get('#password').type('password123');
    cy.get('#role').select('user');
    
    cy.get('#loginBtn').click();
    
    // Should see Logout in navbar
    cy.url().should('include', 'main.html');
    cy.get('.menu').should('contain', 'Logout');
    cy.get('.menu').should('contain', 'User');
  });

  it('should show error for invalid login', () => {
    cy.visit('/login.html');
    cy.get('#email').type('wrong@example.com');
    cy.get('#password').type('wrongpass');
    cy.get('#role').select('user');
    
    cy.get('#loginBtn').click();
    
    cy.get('#error-msg').should('not.be.empty');
  });

  it('should logout successfully', () => {
    // Login first
    cy.visit('/login.html');
    cy.get('#email').type(randomEmail);
    cy.get('#password').type('password123');
    cy.get('#role').select('user');
    cy.get('#loginBtn').click();
    
    // Click Logout
    cy.get('a').contains('Logout').click();
    
    // Should see Login again
    cy.get('.menu').should('contain', 'Login');
    cy.get('.menu').should('not.contain', 'User');
  });
});
