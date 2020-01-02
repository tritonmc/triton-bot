import knex from 'knex';

class DatabaseController {
  constructor() {
    this.db = knex({
      client: 'mysql',
      connection: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'triton',
      },
    });
  }

  addUserToDatabase(discordId, username, id, token) {
    return this.db('twin_tokens').insert({
      discord_id: discordId,
      spigot_username: username,
      spigot_id: id,
      token,
    });
  }
}

export default DatabaseController;
