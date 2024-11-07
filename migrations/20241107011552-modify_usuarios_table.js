'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Permitir que `codigo_verificacion` sea NULL
    await queryInterface.changeColumn('usuarios', 'codigo_verificacion', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Aumentar la longitud de la columna `contrasena` para permitir almacenar contraseñas encriptadas
    await queryInterface.changeColumn('usuarios', 'contrasena', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir los cambios realizados si es necesario
    await queryInterface.changeColumn('usuarios', 'codigo_verificacion', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('usuarios', 'contrasena', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
