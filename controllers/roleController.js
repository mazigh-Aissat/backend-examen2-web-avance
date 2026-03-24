import { Role, User } from "../models/relation.js";

export const addRole = async (req, res) => {
    const role = req.body
    try {
        const result = await Role.create(role)
        res.status(201).json({ message: "Role cree", data: result })

    } catch (error) {
        res.status(200).json({ message: error.message })
    }

}

export const roleList = async (req, res) => {
    try {
        const roles = await Role.findAll()
        res.status(200).json({ data: roles })
    } catch (err) {
        res.status(200).json({ message: err.message })
    }
}

export const deleteRole = async (req, res) => {
    const { id } = req.params
    try {
        const result = await Role.destroy({ where: { id } })
        res.status(200).json({ message: `Role ${id} supprime`, data: result })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }

}

export const roleById = async (req, res) => {
    const { id } = req.params
    try {
        const role = await Role.findByPk(id, {
            include: {
                model: User,
                through: {
                    attributes: []
                }
            }
        })
        res.status(200).json({ data: role })

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

// Controllers lies aux relations

export const roleUsers = async (req, res) => {
    const { id } = req.params
    try {
        const role = await Role.findByPk(id)
        const users = await role.getUsers({
            attributes:{
                exclude:["mot_de_passe"]
            },
        })
        res.status(200).json({ data: users })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }

}