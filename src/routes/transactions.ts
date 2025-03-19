import { FastifyInstance } from "fastify"
import { z } from "zod"
import crypto from 'node:crypto'

import { knex } from "../database"

import { checkSessionIdExists } from "../middleware/check-session-id-exists"

export async function transactionsRoutes(app: FastifyInstance) {

  //Vai ser uado como global todas as rotas vão utilizar
  app.addHook('preHandler', async (req, res) => {
    console.log(`[${req.method}] ${req.url}`)
  })

  app.get("/", { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const sessionId = req.cookies.sessionId

    const transactions = await knex('transactions')
      .where('session_id', sessionId)
      .select('*')

    return { transactions }
  })

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (req) => {

    const sessionId = req.cookies.sessionId

    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(req.params)

    const transaction = await knex('transactions').where({ session_id: sessionId, id: id }).first()

    return { transaction }

  })

  app.get('/summary', { preHandler: [checkSessionIdExists] }, async (req) => {

    const sessionId = req.cookies.sessionId

    const summary = await knex('transactions')
      .where('session_id', sessionId)
      .sum('amount', {
        as: 'amount',
      })
      .first()

    return { summary }
  })

  app.post('/', async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(req.body)

    let sessionId = req.cookies.sessionId // Procurando dentro dos cookies se já existe uma session id

    if (!sessionId) {
      sessionId = crypto.randomUUID() // Se não existir cria um id
      res.cookie('sessionId', sessionId, {
        path: '/', // Em quais os endereços esse cookie vai estar disponível
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId
    })

    return res.status(201).send()
  })

}

//Testes automatizados