const {DataTypes}=require("sequelize")
const sequelize=require("../Utils/db-connection")
const forgotPasswordRequestTable=sequelize.define("forgotPasswordRequestTable",{
    id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true,
  },

  userId: {
    type: DataTypes.INTEGER, 
    allowNull: false,
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, 
  },
  expiresAt: {
  type: DataTypes.DATE,
  allowNull: false
}
});


module.exports=forgotPasswordRequestTable