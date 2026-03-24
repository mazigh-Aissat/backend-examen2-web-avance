import { Router } from "express";
import { addDepartment, deleteDepartment, departmentList, departmentSubjects, departmentUsers, detailsDepartment, updateDepartment, updateDepartmentImage } from "../controllers/departmentController.js";
import upload from "../helpers/fileLoader.js";
import {verifierToken} from "../authentification/verifierToken.js"
import autoriser from "../authentification/autorisation.js"
import departmentRules from "../validations/departmentValidation.js";

const route = Router()

route
    .post('/', upload.single('image'),departmentRules, addDepartment)
    //Ajouter l'authentification pour les routes suivantes
    .all("*",verifierToken)
    .get('/', departmentList)
    .delete('/:id', deleteDepartment)
    .get('/:id', detailsDepartment)
    .put('/:id',departmentRules, updateDepartment)
    //Ajouter une autorisation admin pour les routes suivantes
    .all("*",autoriser(["admin"]))
    .put('/:id/image', upload.single('image'), updateDepartmentImage)
    .get('/:id/users', departmentUsers)
    .get('/:id/subjects', departmentSubjects)

export default route