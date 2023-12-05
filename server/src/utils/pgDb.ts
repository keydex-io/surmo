import pg from 'pg'

const { Pool } = pg
pg.types.setTypeParser(20, parseInt)
pg.types.setTypeParser(23, parseInt)
pg.types.setTypeParser(1700, parseFloat)

export const getPgPool = () => {
  const DATABASE_URL="postgresql://postgres:UniPerpje8524311@localhost:5432/memeordi"
  const db = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
  })
  
  return db;
}
