import { NextFunction, Response, RequestHandler } from "express"
//import { AuthenticatedRequest } from "types"

export const getHeaders: RequestHandler = (req, _res, next) => {
  const userId = req.headers["x-user-id"]
  const role = req.headers["x-user-role"]

  if (userId && role) {
    ;(req as any).user = {
      id: Number(userId),
      role: Number(role),
    }
  }

  next()
}