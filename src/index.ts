import { App } from "./app";
import { BunxyzResponse } from "./response";

const app = new App(3000);

app.use(async (req, next) => {
  const start = Date.now();
  console.log(`--> ${req.method} ${req.url}`);
  try {
    // Espera a que el siguiente middleware o handler termine
    const response = await next();
    const duration = Date.now() - start;
    console.log(
      `<-- ${req.method} ${req.url} ${response.status} (${duration}ms)`
    );
    // Puedes modificar la respuesta aquí si es necesario antes de devolverla
    // response.headers.set('X-Request-Time', `${duration}ms`);
    return response;
  } catch (error) {
    // Manejo de errores en middleware (aunque handleRequest ya tiene un catch)
    console.error("Middleware error:", error);
    return BunxyzResponse.json(
      { error: "Middleware processing error" },
      { status: 500 }
    );
  }
});

app.get("/", () => BunxyzResponse.text("Welcome to the homepage!"));
app.get("/about", () => BunxyzResponse.text("This is the about page."));
app.get("/api/data/:id", (req) => {
  console.log({ req });
  return BunxyzResponse.json({ message: "hello! OK is data" });
});
app.get("/api/data", () =>
  BunxyzResponse.json({ message: "hello! OK is data" })
);
app.post("/api/data", async (req) => {
  const body = await req.json();
  return BunxyzResponse.json({ message: "Data received!", body });
});

app.listen();
