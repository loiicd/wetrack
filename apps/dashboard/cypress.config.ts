import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: "cypress/component/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/component.ts",
    indexHtmlFile: "cypress/support/component-index.html",
  },
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      return config;
    },
  },
  env: {
    TEST_USER_EMAIL: process.env.TEST_USER_EMAIL ?? "test@example.com",
    TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD ?? "TestPass123!",
    TEST_ORG_NAME: process.env.TEST_ORG_NAME ?? "Test Organization",
  },
});
