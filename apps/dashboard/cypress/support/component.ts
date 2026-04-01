// ***********************************************************
// This file is processed and loaded automatically before
// component test files. Use it to set up global configuration
// and behavior that modifies Cypress.
// ***********************************************************

import "./commands";
import { mount } from "cypress/react";

// Import global styles so CSS variables and base styles are available
import "@/app/globals.css";

// Augment the Cypress namespace to include the `mount` command type
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add("mount", mount);
