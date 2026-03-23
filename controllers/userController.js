// Ils suivent le CRUD (les fonctions des bases de donnees)
//Importer le module du hachage des mots de passe
import bcrypt from 'bcryptjs'

//Importer la table des utilisateurs
import { Role, Subject, User } from '../models/relation.js'
import paginate from '../helpers/paginate.js'
import { Op } from 'sequelize'

//-1 Lecture de la liste des utilisateurs
export const userList = async (req, res) => {
    //Liste des utilisateurs
    const { page, size, search } = req.query
    const { limit, offset } = paginate(page, size)
    const condition = search ? { nom: { [Op.like]: `%${search}%` } } : null
    try {
        const { rows: users, count: total } = await User.findAndCountAll({
            attributes: { exclude: ['mot_de_passe'] },
            limit, offset, where: condition
        })
        const currentPage = page ? +page : 1;
        const totalPages = total ? Math.ceil(total / limit) : 1;

        res.status(200).json({ data: { users, total, currentPage, totalPages } })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//-2 Ajout d'un nouvel utilisateur

export const addUser = async (req, res) => {
    //Les informations de la personne a ajouter depuis le formulaire/Postman

    //Construire le chemin de l'image ou du fichier
    const picture = req.file
    //console.log('path', req.body)
    const imagePath = picture?.path?.split('\\').join('/')
    const fullPath = picture ? req.protocol + '://' + req.get('host') + '/' + imagePath : null

    //Contenu du formulaire et mot de passe
    const { mot_de_passe, ...restOfNewUser } = req.body

    //Hachage du mot de passe
    const motDePasseCrypte = bcrypt.hashSync(mot_de_passe)

    //Ajout dans la table avec l'image egalement
    try {
        const result = await User.create({ mot_de_passe: motDePasseCrypte, photo: fullPath, ...restOfNewUser })
        res.status(201).json({ message: "Utilisateur cree avec succes" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//Mise a jour d'un utilisateur
export const updateUser = async (req, res) => {
    const { id } = req.params
    const infoUser = req.body
    const { photo, mot_de_passe, ...infoSansPhoto } = infoUser
    try {
        const user = await User.update(infoSansPhoto, { where: { id } })
        res.status(200).json({ message: `User no ${id} updated`, data: user })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Mise a jour de la photo

export const updateUserPhoto = async (req, res) => {
    const { id } = req.params
    const image = req.file
    const imagePath = image?.path?.split('\\').join('/')
    const fullPath = image ? req.protocol + '://' + req.get('host') + '/' + imagePath : null
    try {
        if (fullPath) {
            const result = await User.update({ photo: fullPath }, { where: { id } })
            res.status(201).json({ message: "Photo de l'utilisateur mise a jour" })
            return
        }
    } catch (error) {
        res.status(404).json({ message: "Photo de l'utilisateur pas mise a jour" })
    }
}

//Suppression d'un utilisateur

export const deleteUser = async (req, res) => {
    //Il faut l'Id ou le parametre de selection
    const { id } = req.params

    try {
        const result = await User.destroy({ where: { id } })
        res.status(200).json({ message: `User no ${id} removed` })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }

}

// Le profil (a partir de l'id)
export const userById = async (req, res) => {
    const { id } = req.params
    // console.log("id", id)
    try {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['mot_de_passe'] }, // Ne pas retourner le mot de passe
            include: [
                "Department", // On pourra utiliser le model ici egalement
                {
                    model: Role,
                    through: {  // Table intermediaire requis meme sans valeur 
                        attributes: []  //Aucun champ de la table intermediaire retourne
                    }
                },
                {
                    model: Subject,
                    through: {  // Table intermediaire requis meme sans valeur 
                        attributes: []  //Aucun champ de la table intermediaire retourne
                    }
                }
            ]
        })
        res.status(200).json({ data: user })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }

}

//Controllers lies aux relations

export const userDepartment = async (req, res) => {
    const { id } = req.params

    try {
        const user = await User.findByPk(id)
        const department = await user.getDepartment()

        res.status(200).json({ data: department })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Les matieres d'un utilisateur
export const userSubjects = async (req, res) => {
    const { id } = req.params

    try {
        const user = await User.findByPk(id)
        const subjects = await user.getSubjects()

        res.status(200).json({ data: subjects })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


//Ajouter des roles a un utilisateur

export const addUserToRoles = async (req, res) => {
    const { ids } = req.body //Tableau d'ids
    // console.log("ids", ids)

    const { id: userId } = req.params
    try {
        const user = await User.findByPk(userId)
        const roles = await Role.findAll({ where: { id: ids } })
        user.setRoles(roles)  //addRoles est aussi possible
        res.status(201).json({ message: "roles ajoutes avec succes" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const addUserToSubjects = async (req, res) => {
    const { ids } = req.body //Tableau d'ids
    // console.log("ids", ids)

    const { id: userId } = req.params
    try {
        const user = await User.findByPk(userId)
        const subjects = await Subject.findAll({ where: { id: ids } })
        user.setSubjects(subjects)  //addRoles est aussi possible
        res.status(201).json({ message: "matieres ajoutees avec succes" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}