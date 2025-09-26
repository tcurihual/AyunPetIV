import { Response } from "express"
import { JsonResponse } from "./types"

export const AppResponse = <T>(res: Response, statusCode: number, message: string, data: T) => {
    const jsonResponse: JsonResponse<T> = {
        message,
        type: "success",
        data,
    }
    return res.status(statusCode).json(jsonResponse)
}
