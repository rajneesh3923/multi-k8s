const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
// app.use(cors());
app.use(bodyParser.json());



// Postgres Client Setup
const { Pool, Client } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
pgClient.on('error', () => console.log('Lost PG connection'));

pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch(err => console.log(err));

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// Express route handlers

// app.get('/', (req, res) => {
//   res.send('Hi');
// });

app.get('/values/all', async (req, res) => {

  const {rows} = await pgClient.query('SELECT * from values');
  console.log('DATA IN POSTGRES', rows)

  res.send(rows);
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});


app.post('/data', (req,res) => {
  res.send(req.body.data)
})

app.post('/values', (req, res) => {

  console.log("FORM DATA", req.body)

  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index], (err,ress) => {
    if(err){
      console.log("PG ERROR ON INSERT")
    } else {
      console.log('PG DATA', ress.rows[0])
      res.send({ working: true });
    }
  });

  
});

app.listen(5000, err => {
  console.log('Listening');
});
