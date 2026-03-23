import { body, param } from "express-validator";

//Regex pour le nom et prenom
const nameRegex =/^[a-zA-Z]{4,}$/ // /^(([A-Za-z]+[\-\']?)*([A-Za-z]+)?\s)+([A-Za-z]+[\-\']?)*([A-Za-z]+)?$/

//On peut aussi utiliser une regex pour le mot de passe
const mdpRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/

const userRules = [
    body('nom').matches(nameRegex).withMessage("le nom n'est pas conforme"),
    body('prenom').matches(nameRegex).withMessage("le prenom n'est pas conforme"),
    body('email').exists().withMessage('email obligatoire').isEmail().withMessage("ceci n'est pas un email"),
    body('mot_de_passe').isString()
        .isLength({ min: 8 }).withMessage('au moins 8 caracteres')
        .matches(/\d/).withMessage('au moins un chiffre')
        .matches(/[a-z]/).withMessage('au moins une lettre minuscule')
        .matches(/[A-Z]/).withMessage('au moins une lettre majuscule')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('au moins un caractere special'),
    body('naissance').optional().isDate().withMessage("la date de naissance doit etre une date valide").custom((value) => {
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 0) {
            throw new Error("la date de naissance ne peut pas etre dans le futur");
        }
        return true;
    }),
    body('biographie').optional().isLength({ min: 20 }).withMessage("la biographie doit contenir au moins 20 caracteres"),
    body('conduite').optional().isIn(["Excellente", "Bonne", "Passable"]).withMessage("la conduite doit etre Excellente, Bonne ou Passable"),
    body('photo').optional().isURL().withMessage("la photo doit etre une url"),
    body('DepartmentId').optional().isInt({ min: 1 }).withMessage("l'id doit etre un entier positif"),
    param('id').optional().isInt({ min: 1 }).withMessage("l'id doit etre un entier positif")

]

export default userRules