import knex from 'knex';

class DatabaseController {
  constructor() {
    this.db = knex({
      client: 'pg',
      connection: process.env.DB_URL || 'postgresql:///triton?host=/run/postgresql',
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
