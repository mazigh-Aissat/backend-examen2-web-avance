import { body, check, param } from "express-validator";
const departmentRules = [
    body('nom').isAlpha().withMessage('le nom doit contenir que des lettres').isLength({ min: 2 }).withMessage('le nom doit contenir au moins 2 caracteres'),
    body('histoire').optional().isLength({ min: 20 }).withMessage("l'histoire doit contenir au moins 20 caracteres"),
    body('domaine').isIn(["sciences", "literature", "autre"]).withMessage("le domaine doit etre sciences, literature ou autre"),
    body('image').optional().isURL().withMessage("l'image doit etre une url"),
    param('id').optional().isInt({ min: 1 }).withMessage("l'id doit etre un entier positif")
]

export default departmentRules