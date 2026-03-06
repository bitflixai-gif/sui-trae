import { createApp } from './AppBuilder.js';
import { setupServer } from '../server.js';

// Example 1: Basic builder usage
export async function exampleBasicBuilder() {
  const app = await createApp()
    .withSensible()
    .withRoutes()
    .start();
  
  return app;
}

// Example 2: Builder with custom cron jobs
export async function exampleBuilderWithCustomCron() {
  const app = await createApp()
    .withSensible()
    .withRoutes()
    .withCronJobs()
    .addCustomCronJob('*/5 * * * *', async () => {
      console.log('Custom cron job running every 5 minutes');
    })
    .start();
  
  return app;
}

// Example 3: Using both approaches together
export async function exampleUsingBoth() {
  // Option A: Use builder for setup, then add custom logic
  const builderApp = await createApp()
    .withSensible()
    .withRoutes()
    .build();
  
  // Add custom routes or plugins to the built app
  builderApp.get('/custom-route', async (request, reply) => {
    return { message: 'Custom route using builder pattern' };
  });
  
  // Option B: Use legacy setup function alongside builder
  const legacyApp = await setupServer();
  
  // You can use both apps in different contexts
  return { builderApp, legacyApp };
}

// Example 4: Advanced builder with conditional features
export async function exampleAdvancedBuilder(enableCron: boolean = true) {
  const builder = createApp()
    .withSensible()
    .withRoutes();
  
  if (enableCron) {
    builder.withCronJobs();
  }
  
  const app = await builder.start();
  return app;
}