import { Express, Request, Response } from "express"

const notImplemented = (name: string) => (_req: Request, res: Response) =>
  res.status(501).json({ error: "Not Implemented", endpoint: name })

export function mountTaskStubs(app: Express, prefix = "/api") {
  // Listar solicitudes propias (usuario normal)
  app.get(`${prefix}/adoptionRequests/mine`, notImplemented("GET /adoptionRequests/mine"))

  // Listar solicitudes propias como dador (shelter)
  app.get(`${prefix}/adoptionRequests/mine-as-giver`, notImplemented("GET /adoptionRequests/mine-as-giver"))

  // Confirmar solicitud (genera código)
  app.post(`${prefix}/adoptionRequests/:id/confirm`, notImplemented("POST /adoptionRequests/:id/confirm"))

  // Validar código (cierra adopción + historial)
  app.post(`${prefix}/adoptionRequests/:id/validate-code`, notImplemented("POST /adoptionRequests/:id/validate-code"))

  // Listar organizaciones no validadas
  app.get(`${prefix}/giverRequests`, notImplemented("GET /giverRequests"))
}