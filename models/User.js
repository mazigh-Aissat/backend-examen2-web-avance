import database from "../config/connection.js";
import { DataTypes } from "sequelize";

//Notre modele

const User = database.define('User', {
    nom: DataTypes.STRING,
    prenom: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique:{args:true, msg:"Email doit etre unique"} },
    mot_de_passe: { type: DataTypes.STRING, allowNull: false },
    naissance: DataTypes.DATEONLY,
    biographie:DataTypes.TEXT,
    conduite:DataTypes.ENUM(["excellente","bonne","passable"]),
    photo:DataTypes.STRING
},{timestamps:false}
)

export default User