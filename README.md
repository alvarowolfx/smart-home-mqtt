# Smart Home MQTT Bridge

End goal of this project is to have a generic bridge between MQTT devices and Smart Home SDK, first just for Google Assistant, but also for Alexa.

This is a Work in Progress.

## Running a MQTT Broker with Authentication

* VerneMQ
* MongoDB
* Webhook with NodeJS

### Run with Docker

```
docker-compose -f stack.yaml up -d
```

### Connect to local Mongodb running inside Docker

```
docker run -it --rm \
  --name mongo-client
  --network smart-home-mqtt_default \
  mongo \
  mongo \
  --host mongo \
  -u vernemq \
  -p vernemq \
  --authenticationDatabase admin \
  devices
```

### Create user for worker and VerneMQ

```
db.createUser({ user: 'vernemq', pwd:  'vernemq', roles : [ { role : "readWrite", db : "devices" }] })
```

### Generate hashed password with bcrypt

```
htpasswd -bnBC 10 "" {YOUR_PASSWORD} | tr -d ':\n' | sed 's/$2y/$2a/'
```

### Example device credentials and the commands cred

```
/* Device */
db.getCollection("vmq_acl_auth").insert({
    "mountpoint" : "",
    "client_id" : "DEADBEEF",
    "username" : "key",
    "passhash" : "$2a$10$eThqQcd23BNDm5IPE7szOekm7wfOg1gs8TirLV4oS6TwYb26jnwpm",
    "publish_acl" : [
        {
            "pattern" : "devices/%c/state/#"
        }
    ],
    "subscribe_acl" : [
        {
            "pattern" : "devices/%c/commands/#"
        }
    ]
})

/* User to send commands */
db.getCollection("vmq_acl_auth").insert({
    "mountpoint" : "",
    "client_id" : "unused",
    "username" : "commander",
    "passhash" : "$2a$10$2phzSZ9RcxTa4kUERwV74OS.Izk8owcxeOzmaVLctnojzl5b9r7Om",
    "publish_acl" : [
        {
            "pattern" : "devices/+/commands/#"
        }
    ],
    "subscribe_acl" : [
        {
            "pattern" : "devices/+/state/#"
        }
    ]
})
```

### Firebase Cloud Functions

* Config
```
firebase functions:config:set mqtt.url="tcp://{YOUR_BROKER}" mqtt.username="{USERNAME}" mqtt.password="{PASSWORD}"
```

#### References

* https://expressjs.com/en/resources/middleware/body-parser.html
* https://devcenter.heroku.com/articles/local-development-with-docker-compose
* https://hub.docker.com/_/mongo
* https://docs.mongodb.com/ecosystem/drivers/node/
* https://docs.vernemq.com/plugindevelopment/webhookplugins
* https://docs.vernemq.com/configuration/db-auth#mongodb
* https://cloud.google.com/community/tutorials/docker-compose-on-container-optimized-os
* https://blog.risingstack.com/getting-started-with-nodejs-and-mqtt/