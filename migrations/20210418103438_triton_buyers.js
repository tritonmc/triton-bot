exports.up = function (knex) {
  return knex.schema.createTable('triton_buyers', (table) => {
    table.string('marketplaceId', 36).notNullable().primary();
    table.string('friendlyName', 50).notNullable();
    table.string('discordTag', 50).nullable().defaultTo(null);
    table.timestamp('date').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {};
