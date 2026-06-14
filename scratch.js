const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/camiseria_urbana' // guessing based on standard dev setup, or maybe let's use the .env
});
// better to use dotenv
