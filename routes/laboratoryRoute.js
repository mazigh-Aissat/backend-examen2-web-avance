import { Router } from "express";
import { addLaboratory, deleteLaboratory, detailsLaboratory, laboratoryEquipments, laboratoryList, laboratorySubjects, updateLaboratory, updateLaboratoryImage } from "../controllers/laboratoryController.js";
import upload from "../helpers/fileLoader.js";
import { verifierToken } from "../authentification/verifierToken.js";
import autoriser from "../authentification/autorisation.js";


const route = Router()

route.all("*", verifierToken)
.get('/', laboratoryList)
    
    .get('/:id', detailsLaboratory)

    .get('/:id/equipment', laboratoryEquipments)
    .get('/:id/subjects', laboratorySubjects)

    .all("*", autoriser(["prof", "admin"]))
    .post('/', upload.single('image'), addLaboratory)
    .delete('/:id', deleteLaboratory)
    .put('/:id', updateLaboratory)
    .put('/:id/image', upload.single('image'), updateLaboratoryImage)

export default route