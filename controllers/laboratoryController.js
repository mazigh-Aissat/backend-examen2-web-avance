import { Op } from "sequelize";
import paginate from "../helpers/paginate.js";
import { Laboratory } from "../models/relation.js";

//1-Liste des labs
export const laboratoryList = async (req, res) => {
    const { page, size, search } = req.query
    const { limit, offset } = paginate(page, size)
    const condition = search ? { nom: { [Op.like]: `%${search}%` } } : null
    try {
        const { rows: laboratories, count: total } = await Laboratory.findAndCountAll({ limit, offset, where: condition })
        const currentPage = page ? +page : 1;
        const totalPages = total ? Math.ceil(total / limit) : 1;
        res.status(200).json({ data: { laboratories, total, currentPage, totalPages } })
    } catch (err) {
        res.status(200).json({ message: err.message })
    }
}

//2-Ajouter un lab

export const addLaboratory = async (req, res) => {
    const infoLab = req.body

    //Construire le chemin de l'image ou du fichier
    const picture = req.file
    //console.log('path', req.body)
    const imagePath = picture?.path?.split('\\').join('/')
    const fullPath = picture ? req.protocol + '://' + req.get('host') + '/' + imagePath : null

    const newLab = { ...infoLab, image: fullPath }
    try {
        const result = await Laboratory.create(newLab)
        res.status(201).json({ message: "Lab cree"})
    } catch (error) {
        res.status(200).json({ message: error.message })
    }
}

//3-Editer un lab

export const updateLaboratory = async (req, res) => {
    const { id } = req.params
    const infoLab = req.body
    const { image, ...infoSansImage } = infoLab
    try {
        const result = await Laboratory.update(infoSansImage, { where: { id } })
        res.status(201).json({ message: "Lab mis a jour" })
    } catch (error) {
        res.status(200).json({ message: error.message })
    }
}

// Mise a jour de la photo

export const updateLaboratoryImage = async (req, res) => {
    const { id } = req.params
    const image = req.file
    const imagePath = image?.path?.split('\\').join('/')
    const fullPath = image ? req.protocol + '://' + req.get('host') + '/' + imagePath : null
    try {
        if (fullPath) {
            const result = await Laboratory.update({ image: fullPath }, { where: { id } })
            res.status(201).json({ message: "Image du lab mise a jour" })
            return
        }


    } catch (error) {
        res.status(404).json({ message: "Image du lab pas mise a jour" })
    }
}

//3-Supprimer un lab
export const deleteLaboratory = async (req, res) => {
    const { id } = req.params
    try {
        const result = await Laboratory.destroy({ where: { id } })
        res.status(200).json({ message: `Laboratoire ${id} supprime`})
    } catch (err) {
        res.status(400).json({ message: err.message })
    }

}

//3-Supprimer un lab
export const detailsLaboratory = async (req, res) => {
    const { id } = req.params
    try {
        const result = await Laboratory.findByPk(id,{
            include:'Department'
        })
        res.status(200).json({ data: result })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }

}

export const laboratorySubjects = async (req, res) => {
    const { id } = req.params
    try {
        const lab = await Laboratory.findByPk(id)
        const subjects = await lab.getSubjects()
        res.status(200).json({ data: subjects })

    } catch (error) {
        res.status(400).json({ message: `Les matieres du lab no ${id} n'existent pas` })
    }
}

export const laboratoryEquipments = async (req, res) => {
    const { id } = req.params
    try {
        const lab = await Laboratory.findByPk(id)
        const equipments = await lab.getEquipment()
        res.status(200).json({ data: equipments })

    } catch (error) {
        res.status(400).json({ message: `Les equipements du lab no ${id} n'existent pas` })
    }
}