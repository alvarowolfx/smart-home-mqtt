require('dotenv/config')
const express = require('express')
const bodyParser = require('body-parser')
const admin = require('firebase-admin')
const bcrypt = require('bcrypt')
const { PubSub } = require('@google-cloud/pubsub')

const topicName = process.env.PUBSUB_TOPIC || 'devices-data'
const databaseURL = process.env.DB_URL
const projectId = process.env.GCLOUD_PROJECT

async function run() {
  admin.initializeApp( {
    databaseURL
  } )
  const pubsub = new PubSub({ projectId })
  try{
    await pubsub.createTopic(topicName)
  }catch(err){}

  const db = admin.database()
  const devicesAclRef = db.ref('devices_acl')

  const app = express()
  const port = parseInt(process.env.PORT || 8080, 10)

  app.use(bodyParser.json())

  app.get('/_health', (req, res) => {
    res.json({ result: 'ok' })
  })

  app.post('/webhook', async (req, res) => {
    try {
      const { client_id: deviceId, payload } = req.body
      const decoded = Buffer.from(payload, 'base64').toString('utf8')
      const attributes = { deviceId }
      const dataBuffer = Buffer.from(decoded)
      await pubsub.topic(topicName).publish(dataBuffer,attributes)
      res.json({ result: 'ok' })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })

  app.post('/auth', async (req, res) => {
    try {
      const { client_id: deviceId, username, password } = req.body
      const deviceSnap = await devicesAclRef.child(deviceId).once('value')
      const device = deviceSnap.val()
      if(device){
        if(device.username === username){
          const match = await bcrypt.compare(password, device.passhash)
          if(match){
            res.json({ result: 'ok' })
            return
          }
        }
      }
      res.status(200).json({ result : { error : 'not_allowed' }})
    } catch (err) {
      res.status(200).json({ result : { error : err.message }})
    }
  })

  app.listen(port, () => console.log(`Worker listening on port ${port}!`))
}

run()
