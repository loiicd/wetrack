describe("Debug: Find Clerk initial state", () => {
  it("searches HTML for Clerk initial auth data", () => {
    cy.on("uncaught:exception", () => false);
    cy.signIn();
    cy.visit("/settings/team");
    cy.wait(2000);
    cy.document().then(doc => {
      const html = doc.documentElement.outerHTML;
      // Find clerk-related text chunks
      const match = html.match(/(__clerk[^"]{0,200}|initialAuth[^"]{0,200}|userId[^"]{0,100})/g);
      cy.writeFile("/tmp/cypress-clerk-html.txt", JSON.stringify({
        matches: match?.slice(0, 10) ?? 'none found',
        htmlSnippet: html.substring(html.indexOf('__clerk'), html.indexOf('__clerk') + 200)
      }, null, 2));
    });
  });
});
