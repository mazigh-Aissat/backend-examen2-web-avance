
//Importer le modele Etudiant
import { User } from '../models/relation.js'

const autoriser = roles => async (req, res, next) => {
    //roles peut etre plusieurs
    //roles=['admin','etudiant']

    //Recuperer l'id a partir de la req
    const id = req.userId

    //Chercher la personne dans la base de donnees

    try {
        const user = await User.findByPk(id)
        if (!user) return res.status(404).json({ message: "Cet utilisateur n'existe pas!" })

        //Recuperer le role de la personne 
        const userRoles = await user.getRoles()

        let hasRole = false
        const userRoleTitles = userRoles.map(role => role.titre.toLowerCase())

        if (!userRoles.length) return res.status(403).json({ message: "Pas autorise a voir cette route !!" })

        roles?.forEach(role => {
            if (userRoleTitles.includes(role.toLowerCase()))
                hasRole = true
        });

        if (hasRole) {
            next()
            return
        } else {
            return res.status(403).json({ message: "Vous n'etes pas autorises..." })
        }


    } catch (error) {
        res.status(403).json({ message: error.message })
    }

}

export default autoriser