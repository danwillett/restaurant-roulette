const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class UserDisliked extends Model {}

UserDisliked.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id',
      },
      onDelete: "CASCADE",
    },
    restaurant_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Disliked',
        key: 'id',
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'user_disliked',
  }
);

module.exports = ProductTag;