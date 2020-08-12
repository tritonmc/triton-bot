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

  getToken(discordId) {
    return this.db('twin_tokens').where({ discord_id: discordId }).select('token');
  }

  getUserFromTag(tag) {
    return this.db('triton_buyers').where({ discordTag: tag }).select();
  }

  getBuyer(friendlyName) {
    return this.db('triton_buyers').where({ friendlyName }).select();
  }
}

export default DatabaseController;
