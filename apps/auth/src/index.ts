import express from "express";
import cors from "cors";
import authRouter from "./routes/auth"; // tu router de auth

const app = express();

app.use(cors());
app.use(express.json());

 // prefijo correcto
 app.use("/api/auth", authRouter);

 // ping de prueba (lo tienes)
 app.get("/api/auth/ping", (req, res) => {
   res.send("pong");
 });

app.listen(process.env.AUTH_PORT || 4000, () => {
  console.log("Auth service running on", process.env.AUTH_PORT || 4000);
});
