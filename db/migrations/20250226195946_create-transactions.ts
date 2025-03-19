import type { Knex } from "knex";

/* O que essa migration vai fazer no nosso banco de dados */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary().notNullable()
    table.text('title').notNullable()
    table.decimal('amount', 10, 2).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}

/* Deu problema, volta */
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('transactions')
}

// Ir para a aula criando tabelas de transições

