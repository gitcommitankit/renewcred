import { app } from './app.js';

const PORT = process.env.SERVER_PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:${PORT}`);
});
