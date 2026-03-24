//Importer la fonction Router pour la creation des routes
import { Router } from "express";


//Importer les controllers
import { addRole, deleteRole, roleList, roleById, roleUsers } from "../controllers/roleController.js";
import { verifierToken } from "../authentification/verifierToken.js";
import autoriser from "../authentification/autorisation.js";

// Creation d"une instance de Router
const roleRoute = Router()

roleRoute.all("*", verifierToken, autoriser(["admin"]))//Toutes les routes de ce routeur seront protégées par l'authentification et l'autorisation admin
    .get('/', roleList)
    .post('/', addRole)
    .delete('/:id', deleteRole)
    .get('/:id', roleById)
    .get('/:id/users', roleUsers)

export default roleRoute