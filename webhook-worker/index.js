const express = require('express')
const bodyParser = require('body-parser')
const mongodb = require('mongodb')
const { MongoClient } = mongodb
const mongoUrl = process.env.DB_URL

async function run(){
  const client = await MongoClient.connect(mongoUrl, { useNewUrlParser : true, useUnifiedTopology : true})
  const db = client.db('devices')
  const dataCollection = db.collection('device_data')
  const historyCollection = db.collection('device_history')

  const app = express()
  const port = parseInt(process.env.PORT,10)

  app.use(bodyParser.json())
  app.post('/webhook', async (req, res) => {
    try {
      const { client_id: deviceId, payload } = req.body
      const decoded = Buffer.from(payload, 'base64').toString('utf8')
      const data =  JSON.parse(decoded)        
      await dataCollection.updateOne({ '_id' : deviceId }, { '$set' : data }, { upsert : true})    
      await historyCollection.insertOne({
        ...data,
        deviceId,
        time : new Date()
      })    
      res.json({ result : 'ok '})    
    }catch(err){
      res.status(500).json({ message : err.message })
    }
  })

  app.listen(port, () => console.log(`Worker listening on port ${port}!`))
}

run()