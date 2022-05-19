const express = require('express');
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.json())
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.moy4n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run () {
  try{

    await client.connect();
    const appointementCollection = client.db('dental-Practice').collection('appointments');
    const appointementPatients = client.db('dental-Practice').collection('patients')
    const userCollection = client.db('dental-Practice').collection('users')

    // load all apointments 
    app.get('/appointments', async(req, res) => {
      const query = {};
      const cursor = appointementCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

    function verifyJwt(req, res, next){

      const token = req?.headers?.authorization;
      const getToken = JSON.parse(token.split(' ')[1])

      if(!getToken){
        return res.status(401).send({message: 'unauthorized access'});
      }
      jwt.verify(getToken, process.env.DB_TOKEN, (error, decoded) => {
        if(error){
          return res.status(403).send({message: 'forbidden accesss'})
        }
        req.decoded = decoded;
        next()
      })

    }

    // load patient email appointment 
    app.get('/myappointments', verifyJwt, async(req, res) => {
      const decodedEmail = req.decoded?.email;
      const email = req.query.email;
      if(email === decodedEmail){
        const query = {email};
        const result = await appointementPatients.find(query).toArray();
        res.send(result)
      }
      else{
        res.status(403).send({message: 'forbidden access'})
      }
    })
    // load date wise patients appointments
    app.get('/patients', async(req, res) => {
      const date = req.query.date;
      const query = {date};
      const cursor = appointementPatients.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })
    
    // post an appointment
    app.post('/postpatientinfo', async(req, res) => {
      const patientInfo = req.body;
      const result = await appointementPatients.insertOne(patientInfo)
      res.send(result)
    })

    // put user 
    app.put('/user', async(req, res) => {
      const email = req.query?.email;
      const user = req.body;
      const find = { email: email }
      const options = { upsert: true };
      const updateDoc = {
        $set: user
      }

      const token = jwt.sign({ email }, process.env.DB_TOKEN, { expiresIn: '1d' })

      const result = await userCollection.updateOne(find, updateDoc, options);

      res.send({result, token});

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