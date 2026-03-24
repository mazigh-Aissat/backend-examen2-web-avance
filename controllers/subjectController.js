// Ils suivent le CRUD (les fonctions des bases de donnees)

//Importer la table 
import { Subject, User } from '../models/relation.js'
import paginate from '../helpers/paginate.js'
import { Op } from 'sequelize'

//-1 Lecture de la liste des matieres
export const subjectList = async (req, res) => {
    //Liste des utilisateurs
    const { page, size, search } = req.query
    const { limit, offset } = paginate(page, size)
    const condition = search ? { nom: { [Op.like]: `%${search}%` } } : null
    try {
        const { rows: subjects, count: total } = await Subject.findAndCountAll({
            attributes: { exclude: ['mot_de_passe'] },
            limit, offset, where: condition
        })
        const currentPage = page ? +page : 1;
        const totalPages = total ? Math.ceil(total / limit) : 1;

        res.status(200).json({ data: { subjects, total, currentPage, totalPages } })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//-2 Ajout d'une nouvelle matiere

export const addSubject = async (req, res) => {
    //Les informations de la personne a ajouter depuis le formulaire/Postman

    //Construire le chemin de l'image ou du fichier
    const picture = req.file
    //console.log('path', req.body)
    const imagePath = picture?.path?.split('\\').join('/')
    const fullPath = picture ? req.protocol + '://' + req.get('host') + '/' + imagePath : null

    //Contenu du formulaire 
    const newSubject = req.body

    //Ajout dans la table avec l'image egalement
    try {
        const result = await Subject.create({ ...newSubject, image: fullPath })
        res.status(201).json({ message: "Matiere creee avec succes" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//Mise a jour d'une matiere
export const updateSubject = async (req, res) => {
    const { id } = req.params
    const infoSubject = req.body

    const { image, ...infoSansPhoto } = infoSubject
    try {
        const subject = await Subject.update(infoSansPhoto, { where: { id } })
        res.status(200).json({ message: `User no ${id} updated` })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Mise a jour de la photo

export const updateSubjectPhoto = async (req, res) => {
    const { id } = req.params
    const image = req.file
    const imagePath = image?.path?.split('\\').join('/')
    const fullPath = image ? req.protocol + '://' + req.get('host') + '/' + imagePath : null
    try {
        if (fullPath) {
            const result = await Subject.update({ image: fullPath }, { where: { id } })
            res.status(201).json({ message: "Photo de la matiere mise a jour" })
            return
        }
    } catch (error) {
        res.status(404).json({ message: "Photo de la matiere pas mise a jour" })
    }
}

//Suppression d'une matiere

export const deleteSubject = async (req, res) => {
    //Il faut l'Id ou le parametre de selection
    const { id } = req.params

    try {
        const result = await Subject.destroy({ where: { id } })
        res.status(200).json({ message: `Subject no ${id} removed` })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }

}

// Le profil (a partir de l'id)
export const subjectById = async (req, res) => {
    const { id } = req.params
    // console.log("id", id)
    try {
        const subject = await Subject.findByPk(id, {
            include: [
                "Department","Laboratory", // On pourra utiliser le model ici egalement
                {
                    model: User,
                    through: {  // Table intermediaire requis meme sans valeur 
                        attributes: []  //Aucun champ de la table intermediaire retourne
                    }
                }
            ]
        })
        res.status(200).json({ data: subject })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }

}

//Controllers lies aux relations

export const subjectDepartment = async (req, res) => {
    const { id } = req.params

    try {
        const subject = await Subject.findByPk(id)
        const department = await subject.getDepartment()

        res.status(200).json({ data: department })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Les utilisateurs d'une matiere
export const subjectUsers = async (req, res) => {
    const { id } = req.params

    try {
        const subject = await Subject.findByPk(id)
        const users = await subject.getUsers({
            attributes:{
                exclude:["mot_de_passe"]
            },
        })

        res.status(200).json({ data: users })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//Inscrire des utilisateurs 

export const addUsersToSubject = async (req, res) => {
    const { ids } = req.body //Tableau d'ids
    // console.log("ids", ids)

    const { id: subId } = req.params
    try {
        const subject = await Subject.findByPk(subId)
        const users = await User.findAll({ where: { id: ids } })
        subject.addUsers(users)  //setUsers est aussi possible
        res.status(201).json({ message: "utilisateurs ajoutes avec succes" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}