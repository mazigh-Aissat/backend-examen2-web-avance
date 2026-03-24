import database from "../config/connection.js";
import { DataTypes } from "sequelize";

//Notre modele

const Department = database.define('Department', {
    nom: { type: DataTypes.STRING, allowNull: false },
    histoire: { type: DataTypes.TEXT },
    domaine:{type:DataTypes.ENUM(["sciences","literature","autre"]),allowNull:false},
    image: DataTypes.STRING,
},{timestamps:false}
)

export default Department