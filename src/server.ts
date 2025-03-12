import fastify from 'fastify';
import knex from 'knex';
import { randomUUID } from 'node:crypto';
import { env } from './env';

const app = fastify();

app.get('/hello', async () => {
  const tables = await knex('sqlite_schema')
    .select('*')

  return tables;
})

app.get('/transactions', async () => {
  const transactions = await knex('transactions').insert({
    id: randomUUID(),
    title: 'Transação de teste',
    amount: 1000,
  }).returning('*')

  return transactions;
})

app.listen({
  port: env.PORT,
}).then(() => {
  console.log('HTTP server running ...')
})