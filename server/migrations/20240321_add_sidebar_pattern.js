const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('settings', 'sidebar_pattern', {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'none'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('settings', 'sidebar_pattern');
  }
}; 