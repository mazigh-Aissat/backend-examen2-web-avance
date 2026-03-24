import database from "../config/connection.js";
import { DataTypes } from "sequelize";

//Notre modele

const Equipment = database.define('Equipment', {
    nom: { type: DataTypes.STRING, allowNull: false },
    modele: { type: DataTypes.ENUM(["nouveau", "ancien", "refait"]), allowNull: false },
    description: { type: DataTypes.TEXT },
    image: DataTypes.STRING,
},{timestamps:false}
)

export default Equipment