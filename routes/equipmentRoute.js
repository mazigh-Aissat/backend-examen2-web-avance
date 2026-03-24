import { Router } from "express";
import { addDepartment, deleteDepartment, departmentList, departmentSubjects, departmentUsers, detailsDepartment, updateDepartment, updateDepartmentImage } from "../controllers/departmentController.js";
import upload from "../helpers/fileLoader.js";
import { addEquipment, deleteEquipment, detailsEquipment, equipmentList, updateEquipment, updateEquipmentImage } from "../controllers/equipmentController.js";
import { verifierToken } from "../authentification/verifierToken.js";
import autoriser from "../authentification/autorisation.js";

const route = Router()

route.all("*", verifierToken)
    .get('/', equipmentList)
    .get('/:id', detailsEquipment)

    .all("*", autoriser(["prof"]))
    
    .put('/:id', updateEquipment)
    .post('/', upload.single('image'), addEquipment)
    .delete('/:id', deleteEquipment)
    .put('/:id/image', upload.single('image'), updateEquipmentImage)

export default route