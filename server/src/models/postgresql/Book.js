const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Book = sequelize.define("Book", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  published_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  cover_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "authors",
      key: "id",
    },
  },
});

module.exports = Book;
