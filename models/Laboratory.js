import database from "../config/connection.js";
import { DataTypes } from "sequelize";

//Notre modele

const Laboratory = database.define('Laboratory', {
    nom: { type: DataTypes.STRING, allowNull: false },
    salle: { type: DataTypes.STRING},
    information: { type: DataTypes.TEXT },
    image: DataTypes.STRING,
},{timestamps:false}
)

export default Laboratory