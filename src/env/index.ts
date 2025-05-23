import { config } from 'dotenv';
import { z } from 'zod';

//Criar configurações de acordo com o ambiente
if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' });
} else {
  config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']).default('sqlite'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string(),
})

// export const env = envSchema.parse(process.env); // Nesse parse se der erro ele gera um erro genérico e para a aplicação

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error(' ⚠️ Invalid environment variables', _env.error.format());

  throw new Error('⚠️ Invalid environment variables')
}

export const env = _env.data;
