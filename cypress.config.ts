import { defineConfig } from "cypress";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import { createEsbuildPlugin } from "@badeball/cypress-cucumber-preprocessor/esbuild";
import dotenv from "dotenv";

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
): Promise<Cypress.PluginConfigOptions> {
  // This is required for the preprocessor to be able to generate JSON reports after each run, and more,
  await addCucumberPreprocessorPlugin(on, config);

  on(
    "file:preprocessor",
    createBundler({
      plugins: [createEsbuildPlugin(config)],
    }),
  );

  // Make sure to return the config object as it might have been modified by the plugin.
  return config;
}

dotenv.config();

export default defineConfig({
  e2e: {
  baseUrl: process.env.BASE_URL ?? "http://localhost:8000",
    specPattern: "**/*.feature",
    env: {
      API_URL: process.env.NEXT_PUBLIC_API_URL,
      nOfElements: 0
    },
    video: true,
    videoCompression: 32,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 1,
      openMode: 0
    },
    defaultCommandTimeout: 20000,
    pageLoadTimeout: 60000,
    setupNodeEvents
  },

  viewportWidth: 1920,
  viewportHeight: 1080,

  watchForFileChanges: false

});