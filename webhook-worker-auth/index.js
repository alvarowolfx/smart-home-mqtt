require('dotenv/config')
const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')
const admin = require('firebase-admin')
const bcrypt = require('bcrypt')
const { isPatternAllowedToPublish, isPatternAllowedToSubscribe } = require('./pattern')

const serviceAccountFile = process.env.SERVICE_ACCOUNT_FILE
const databaseURL = process.env.DB_URL
let devicesAclRef

async function getDeviceAcl(deviceId){
  const deviceSnap = await devicesAclRef.child(deviceId).once('value')
  const device = deviceSnap.val()
  return device
}

async function run() {
  if(serviceAccountFile){
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountFile))
    admin.initializeApp( {
      credential: admin.credential.cert(serviceAccount),
      databaseURL
    } )
  }else{
    admin.initializeApp( {
      databaseURL
    } )
  }

  const db = admin.database()
  devicesAclRef = db.ref('devices_acl')

  const app = express()
  const port = parseInt(process.env.PORT || 8080, 10)

  app.use(bodyParser.json())

  app.get('/_health', (req, res) => {
    res.json({ result: 'ok' })
  })

  app.post('/register', async (req, res) => {
    try {
      const { client_id: deviceId, username, password } = req.body
      const device = await getDeviceAcl(deviceId)
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

  app.post('/subscribe', async (req, res) => {
    try {
      //console.log('Subscribe', req.body)
      const { client_id: deviceId, username, mountpoint, topic } = req.body
      const device = await getDeviceAcl(deviceId)
      if(device){
        const acls = Object.values(device.subscribe_acl)
        const deviceInfo = { username, mountpoint, clientId : deviceId }
        const match = acls.find( acl => {
          const { pattern } = acl
          return isPatternAllowedToSubscribe(topic, pattern, deviceInfo)
        })
        if(match){
          res.json({ result: 'ok' })
          return
        }
      }
      res.status(200).json({ result : { error : 'not_allowed' }})
    } catch (err) {
      res.status(200).json({ result : { error : err.message }})
    }
  })

  app.post('/publish', async (req, res) => {
    try {
      const { client_id: deviceId, username, mountpoint, topic } = req.body
      //console.log('Publish', req.body)
      const device = await getDeviceAcl(deviceId)
      if(device){
        const acls = Object.values(device.publish_acl)
        const deviceInfo = { username, mountpoint, clientId : deviceId }
        const match = acls.find( acl => {
          const { pattern } = acl
          return isPatternAllowedToPublish(topic, pattern, deviceInfo)
        })
        if(match){
          res.json({ result: 'ok' })
          return
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