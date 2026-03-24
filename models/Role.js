import database from "../config/connection.js";
import { DataTypes } from "sequelize";

const Role = database.define('Role', {
    titre: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT
},{timestamps:false}
)

export default Role