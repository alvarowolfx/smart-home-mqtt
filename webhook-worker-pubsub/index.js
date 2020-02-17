require('dotenv/config')
const express = require('express')
const bodyParser = require('body-parser')
const { PubSub } = require('@google-cloud/pubsub')

const topicName = process.env.PUBSUB_TOPIC || 'devices-inbound'
const projectId = process.env.GCLOUD_PROJECT

async function run() {
  const pubsub = new PubSub({ projectId })
  try{
    await pubsub.createTopic(topicName)
  }catch(err){}

  const app = express()
  const port = parseInt(process.env.PORT || 8080, 10)

  app.use(bodyParser.json())

  app.get('/_health', (req, res) => {
    res.json({ result: 'ok' })
  })

  app.post('/webhook', async (req, res) => {
    try {
      const { client_id: deviceId, topic, payload } = req.body
      const decoded = Buffer.from(payload, 'base64').toString('utf8')
      const attributes = { deviceId, topic }
      const dataBuffer = Buffer.from(decoded)
      await pubsub.topic(topicName).publish(dataBuffer,attributes)
      res.json({ result: 'ok' })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })

  app.listen(port, () => console.log(`Worker listening on port ${port}!`))
}

run()
