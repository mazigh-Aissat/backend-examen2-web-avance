import { Router } from "express";

import { login } from "../authentification/login.js";

const authRoute = Router()

authRoute.post('/', login)

export default authRoute