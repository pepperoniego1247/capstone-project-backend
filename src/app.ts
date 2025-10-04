import express from "express";
import morgan from "morgan";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import personaRoutes from "./routes/persona.routes";
import citasRoutes from "./routes/citas.routes";
import bodyParser from "body-parser";
import trabajadoresRoutes from "./routes/trabajadores.routes";
import empleadoresRoutes from "./routes/empleadores.routes";
import entrevistaRoutes from "./routes/entrevistas.routes";
import conveniosRoutes from "./routes/convenios.routes";
import pedidosRoutes from "./routes/pedidos.routes";

const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan("dev"));
app.use(
  cors({
    origin: "*",
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);
app.use(express.json());
app.use(userRoutes);
app.use(citasRoutes);
app.use(empleadoresRoutes);
app.use(personaRoutes);
app.use(pedidosRoutes);
app.use(entrevistaRoutes);
app.use(trabajadoresRoutes);
app.use(conveniosRoutes);

export default app;
