import { expect, it, beforeAll, afterAll, describe, beforeEach } from 'vitest';
import { execSync } from 'node:child_process';
import supertest from 'supertest';
import { app } from '../src/app';

// Teste E2E
describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready(); //Carregar todos os nossos plugins
  })

  afterAll(async () => {
    await app.close(); //Após tudo ser carregado e executar, fechar a aplicação
  })

  beforeEach(() => {
    // A cada teste eu apago o banco de dados e crio novamente
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    // fazer a chamada HTTP para criar uma nova transação
    const response = await supertest(app.server).post('/transactions').send({
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    })

    // verificar se a transação foi criada
    expect(response.statusCode).toEqual(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await supertest(app.server).post('/transactions').send({
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    })

    const cookies = createTransactionResponse.get('Set-Cookie') ?? []

    // console.log(cookies)

    const listTransactionsResponse = await supertest(app.server).get('/transactions').set('Cookie', cookies)

    expect(listTransactionsResponse.statusCode).toEqual(200)
    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000
      })
    ])

  })

  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await supertest(app.server).post('/transactions').send({
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    })

    const cookies = createTransactionResponse.get('Set-Cookie') ?? []

    // console.log(cookies)

    const listTransactionsResponse = await supertest(app.server).get('/transactions').set('Cookie', cookies)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionResponse = await supertest(app.server).get(`/transactions/${transactionId}`).set('Cookie', cookies)

    // console.log(getTransactionResponse.body)

    expect(listTransactionsResponse.statusCode).toEqual(200)
    expect(getTransactionResponse.statusCode).toEqual(200)
    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000
      })
    )

  })

  it('should be able to get the summary', async () => {
    const createTransactionResponse = await supertest(app.server).post('/transactions').send({
      title: 'Credit transaction',
      amount: 5000,
      type: 'credit',
    }).expect(201)

    const cookies = createTransactionResponse.get('Set-Cookie') ?? []

    await supertest(app.server).post('/transactions').set('Cookie', cookies).send({
      title: 'Debit transaction',
      amount: 2000,
      type: 'debit',
    }).expect(201)

    // console.log(cookies)

    const summaryResponse = await supertest(app.server).get('/transactions/summary').set('Cookie', cookies)

    expect(summaryResponse.body.summary).toEqual({
      amount: 3000
    })

  })

})