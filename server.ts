import 'dotenv/config.js';

import { loadEnv } from './v3/env'; // adjust the path as needed

async function startServer() {
  try {
    await loadEnv(); // Load secrets before doing anything else
    const { default: app, wsServer } = await import('./v3/app');
    const { PORT } = await import('./v3/config/constants');

    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
    wsServer.listen(3004, () => console.log('Websocket listening on port 3004'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
