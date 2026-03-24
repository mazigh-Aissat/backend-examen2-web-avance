import { Op } from "sequelize";
import paginate from "../helpers/paginate.js";
import { Department } from "../models/relation.js";
import { validationResult } from "express-validator";

//1-Liste des departements
export const departmentList = async (req, res) => {
    const { page, size, search } = req.query
    const { limit, offset } = paginate(page, size)
    const condition = search ? { nom: { [Op.like]: `%${search}%` } } : null
    try {
        const { rows: departments, count: total } = await Department.findAndCountAll({ limit, offset, where: condition })
        const currentPage = page ? +page : 1;
        const totalPages = total ? Math.ceil(total / limit) : 1;
        res.status(200).json({ data: { departments, total, currentPage, totalPages } })
    } catch (err) {
        res.status(200).json({ message: err.message })
    }
}

//2-Ajouter un departement

export const addDepartment = async (req, res) => {
    const infoDepartment = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    //Construire le chemin de l'image ou du fichier
    const picture = req.file
    //console.log('path', req.body)
    const imagePath = picture?.path?.split('\\').join('/')
    const fullPath = picture ? req.protocol + '://' + req.get('host') + '/' + imagePath : null

    const newDepartment = { ...infoDepartment, image: fullPath }
    try {
        const result = await Department.create(newDepartment)
        res.status(201).json({ message: "Departement cree", data: result })
    } catch (error) {
        res.status(200).json({ message: error.message })
    }
}

//3-Editer un departement

export const updateDepartment = async (req, res) => {
    const { id } = req.params
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const infoDepartment = req.body
    const { image, ...infoSansImage } = infoDepartment

    try {
        const result = await Department.update(infoSansImage, { where: { id } })
        res.status(201).json({ message: "Departement mis a jour" })
    } catch (error) {
        res.status(200).json({ message: error.message })
    }
}

// Mise a jour de la photo

export const updateDepartmentImage = async (req, res) => {
    const { id } = req.params
    const image = req.file
    const imagePath = image?.path?.split('\\').join('/')
    const fullPath = image ? req.protocol + '://' + req.get('host') + '/' + imagePath : null
    try {
        if (fullPath) {
            const result = await Department.update({ image: fullPath }, { where: { id } })
            res.status(201).json({ message: "Image du departement mise a jour" })
            return
        }


    } catch (error) {
        res.status(404).json({ message: "Image du departement pas mise a jour" })
    }
}

//3-Supprimer un department
export const deleteDepartment = async (req, res) => {
    const { id } = req.params
    try {
        const result = await Department.destroy({ where: { id } })
        res.status(200).json({ message: `Departement ${id} supprime`, data: result })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }

}

//3-Detils d'un department
export const detailsDepartment = async (req, res) => {
    const { id } = req.params
    try {
        const result = await Department.findByPk(id)
        res.status(200).json({ data: result })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }

}

export const departmentUsers = async (req, res) => {
    const { id } = req.params
    try {
        const department = await Department.findByPk(id)
        const users = await department.getUsers({
            attributes:{
                exclude:["mot_de_passe"]
            },
        })
        res.status(200).json({ data: users })

    } catch (error) {
        res.status(400).json({ message: `Les utilisateurs du departement no ${id} n'existent pas` })
    }
}

export const departmentSubjects = async (req, res) => {
    const { id } = req.params
    try {
        const department = await Department.findByPk(id)
        const subjects = await department.getSubjects()
        res.status(200).json({ data: subjects })

    } catch (error) {
        res.status(400).json({ message: `Les matieres du departement no ${id} n'existent pas` })
    }
}