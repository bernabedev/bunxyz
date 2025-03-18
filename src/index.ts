import { App } from "./app";
import { BunxyzResponse } from "./response";

const app = new App(3000);

app.use(async (req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  return await next();
});

app.use(async (req, res, next) => {
  const startTime = Date.now();
  const response = await next();
  const endTime = Date.now();
  console.log(`Request processed in ${endTime - startTime}ms`);
  return response;
});

app.get("/", () => BunxyzResponse.text("Welcome to the homepage!"));
app.get("/about", () => BunxyzResponse.text("This is the about page."));
app.get("/api/data", () =>
  BunxyzResponse.json({ message: "hello! OK is data" })
);
app.post("/api/data", async (req) => {
  const body = await req.json();
  return BunxyzResponse.json({ message: "Data received!", body });
});

app.listen();
