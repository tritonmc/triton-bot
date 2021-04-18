exports.up = function (knex) {
  return knex.schema.createTable('twin_tokens', (table) => {
    table.string('discord_id', 25).nullable().defaultTo(null).unique();
    table.string('spigot_username', 36).notNullable().unique();
    table.string('spigot_id', 100).nullable().defaultTo(null).unique();
    table.string('token', 48).notNullable().unique();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('twin_tokens');
};
