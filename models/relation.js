import User from "./User.js";
import Department from "./Department.js";
import Role from "./Role.js";
import Equipment from "./Equipment.js";
import Laboratory from "./Laboratory.js";
import Subject from "./Subject.js";

//Relations entre entites

Department.hasMany(User)
User.belongsTo(Department)

Department.hasMany(Subject)
Subject.belongsTo(Department)

Department.hasMany(Laboratory)
Laboratory.belongsTo(Department)

Laboratory.hasMany(Subject)
Subject.belongsTo(Laboratory)

Laboratory.hasMany(Equipment)
Equipment.belongsTo(Laboratory)

Subject.belongsToMany(User,{
    through: 'subject_user'
})
User.belongsToMany(Subject,{
    through: 'subject_user'
})

Role.belongsToMany(User, {
    through: 'role_user'
})

User.belongsToMany(Role, {
    through: 'role_user'
})



export { Department, User, Role, Equipment,Laboratory,Subject }