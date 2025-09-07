import { Router } from "express";
const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  // TODO: validar contra tu DB. Por ahora, finge OK si vienen ambos:
  if (!email || !password) return res.status(400).json({ msg: "Missing credentials" });

  // token fake para probar (reemplaza por JWT real)
  const token = "fake.jwt.token";
  const user = { id: "1", name: "Demo", email, role: "adoptante" };

  return res.json({ token, user });
});

router.get("/me", (req, res) => {
  // en real, parsea el JWT y devuelve el usuario
  return res.json({ id: "1", name: "Demo", email: "demo@mail.com", role: "adoptante" });
});

export default router;
