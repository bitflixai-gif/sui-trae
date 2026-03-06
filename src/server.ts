import { createApp } from './builder/AppBuilder.js';

async function main() {
  // Builder-style setup (new way)
  const app = await createApp()
    .withSensible()
    .withRoutes()
    .withCronJobs()
    .start();

  console.log(`Server running on port ${app.server.address().port}`);
}

// Legacy setup function for backward compatibility
export async function setupServer() {
  const app = await createApp()
    .withSensible()
    .withRoutes()
    .withCronJobs()
    .build();
  
  return app;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
