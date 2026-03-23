import { Op } from "sequelize";
import paginate from "../helpers/paginate.js";
import { Equipment } from "../models/relation.js";

//1-Liste des equipements
export const equipmentList = async (req, res) => {
    const { page, size, search } = req.query
    const { limit, offset } = paginate(page, size)
    const condition = search ? { nom: { [Op.like]: `%${search}%` } } : null
    try {
        const { rows: equipments, count: total } = await Equipment.findAndCountAll({ limit, offset, where: condition })
        const currentPage = page ? +page : 1;
        const totalPages = total ? Math.ceil(total / limit) : 1;
        res.status(200).json({ data: { equipments, total, currentPage, totalPages } })
    } catch (err) {
        res.status(200).json({ message: err.message })
    }
}

//2-Ajouter un equipment

export const addEquipment = async (req, res) => {
    const infoEquipment = req.body

    //Construire le chemin de l'image ou du fichier
    const picture = req.file
    //console.log('path', req.body)
    const imagePath = picture?.path?.split('\\').join('/')
    const fullPath = picture ? req.protocol + '://' + req.get('host') + '/' + imagePath : null

    const newEquipment = { ...infoEquipment, image: fullPath }
    try {
        const result = await Equipment.create(newEquipment)
        res.status(201).json({ message: "Equipement cree" })
    } catch (error) {
        res.status(200).json({ message: error.message })
    }
}

//3-Editer un equipement

export const updateEquipment = async (req, res) => {
    const { id } = req.params
    const infoEquipment = req.body
    const { image, ...infoSansImage } = infoEquipment

    try {
        const result = await Equipment.update(infoSansImage, { where: { id } })
        res.status(201).json({ message: "Equipement mis a jour" })
    } catch (error) {
        res.status(200).json({ message: error.message })
    }
}

// Mise a jour de la photo

export const updateEquipmentImage = async (req, res) => {
    const { id } = req.params
    const image = req.file
    const imagePath = image?.path?.split('\\').join('/')
    const fullPath = image ? req.protocol + '://' + req.get('host') + '/' + imagePath : null
    try {
        if (fullPath) {
            const result = await Equipment.update({ image: fullPath }, { where: { id } })
            res.status(201).json({ message: "Image du materiel mise a jour" })
            return
        }


    } catch (error) {
        res.status(404).json({ message: "Image du materiel pas mise a jour" })
    }
}

//3-Supprimer un equipement
export const deleteEquipment = async (req, res) => {
    const { id } = req.params
    try {
        const result = await Equipment.destroy({ where: { id } })
        res.status(200).json({ message: `Equipement ${id} supprime`, data: result })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }

}

//3-Details d'un equipement
export const detailsEquipment = async (req, res) => {
    const { id } = req.params
    try {
        const result = await Equipment.findByPk(id,{
            include:'Laboratory'
        })
        res.status(200).json({ data: result })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }

}