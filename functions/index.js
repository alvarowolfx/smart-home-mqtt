const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()
const db = admin.database()
const devicesRef = db.ref('devices')

exports.processDeviceData = functions.pubsub
  .topic('devices-data')
  .onPublish( (message) => {
  const attributes = message.attributes
  const data = message.json
  const deviceId = attributes.deviceId

  return devicesRef.child(deviceId).child('data').update({
    ...data,
    time : Date.now()
  })
})
