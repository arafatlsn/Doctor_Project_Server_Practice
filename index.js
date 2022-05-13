const express = require('express');
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.moy4n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run () {
  try{

    await client.connect();
    const appointementCollection = client.db('dental-Practice').collection('appointments');

    app.get('/appointments', async(req, res) => {
      const query = {};
      const cursor = appointementCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

  }
  finally{

  }
}

run()


app.get('/', (req, res) => {
  res.send('server running')
})

app.listen(port, () => {
  console.log('server running on', port)
})