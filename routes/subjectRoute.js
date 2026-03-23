//Importer la fonction Router pour la creation des routes
import { Router } from "express";

//Importer les controllers
import { addSubject, addUsersToSubject, deleteSubject, subjectById, subjectDepartment, subjectList, subjectUsers, updateSubject, updateSubjectPhoto } from "../controllers/subjectController.js";

//Importer la fonction pour charger les images/fichiers
import upload from "../helpers/fileLoader.js";
import { verifierToken } from "../authentification/verifierToken.js";
import autoriser from "../authentification/autorisation.js";


// Creation d"une instance de Router
const route = Router()

route
    .get('/', subjectList)
    .get('/:id', subjectById)
    .get('/:id/department', subjectDepartment)
    .post('/', upload.single('image'), addSubject)
    
    //Proteger toutes les routes ci-dessous
    .all("*", verifierToken)
    .put('/:id', updateSubject)
    .put('/:id/image', upload.single('image'), updateSubjectPhoto)

    .all("*",autoriser(["admin"])) 

    .delete('/:id', deleteSubject)
    .post('/:id/users', addUsersToSubject)
    .get('/:id/users', subjectUsers)

export default route