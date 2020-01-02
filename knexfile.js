require('dotenv').config();

module.exports = {
  client: 'mysql',
  connection: {
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'triton',
    },
  },
};
