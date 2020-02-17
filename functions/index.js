const functions = require('firebase-functions')
const admin = require('firebase-admin')
const mqtt = require('async-mqtt')

admin.initializeApp()
const db = admin.database()
const devicesRef = db.ref('devices')

exports.processDeviceData = functions.pubsub
  .topic('devices-inbound')
  .onPublish( (message) => {
  const attributes = message.attributes
  const data = message.json
  const { deviceId, topic } = attributes

  return devicesRef.child(deviceId).child('data').update({
    ...data,
    lastTopic : topic,
    time : Date.now()
  })
})

exports.sendCommand = functions.pubsub
  .topic('devices-outbound')
  .onPublish( async (message) => {
  const config = functions.config()
  const { url, username, password } = config.mqtt

  const attributes = message.attributes
  const data = message.json
  const { deviceId } = attributes

  try {
    const client = await mqtt.connectAsync(url, { username, password, clientId : username })
    await client.publish(`devices/${deviceId}/commands`, JSON.stringify(data))
    await client.end()
    return Promise.resolve()
  }catch(err){
    return Promise.reject(err)
  }
})
