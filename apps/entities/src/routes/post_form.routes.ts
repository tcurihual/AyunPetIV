import { Router } from "express"
import * as ctrl from "../controllers/post_form"

const route = Router()

route.get("/", ctrl.list)

route.post("/", ctrl.create)

// route.patch("/:id", ctrl.update)

// route.delete("/:id", ctrl.remove)

export default route
