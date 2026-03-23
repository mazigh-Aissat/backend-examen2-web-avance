import database from "../config/connection.js";
import { DataTypes } from "sequelize";

//Notre modele

const Subject = database.define('Subject', {
    nom: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, unique: {args:true, msg:"Code doit etre unique"}, allowNull: false },
    description: { type: DataTypes.TEXT },
    statut:{type:DataTypes.ENUM(["requis","optionnel"])},
    image: DataTypes.STRING,
},{timestamps:false}
)

export default Subject