import { App } from "bunxyz";
const app = new App();
app.listen((port: number) => {
  console.log(`🦊 Bunxyz server running at http://localhost:${port}`);
});
