# Smart Home MQTT Bridge

End goal of this project is to have a generic bridge between MQTT devices and Smart Home SDK, first just for Google Assistant, but also for Alexa.

This is a Work in Progress.

## Running a MQTT Broker with Authentication

* VerneMQ
* MongoDB
* Webhook with NodeJS

### Run with Docker

```
docker run -f stack.yaml up
```

### Generate hashed password with bcrypt

```
htpasswd -bnBC 10 "" {YOUR_PASSWORD} | tr -d ':\n' | sed 's/$2y/$2a/'
```

#### References

* https://expressjs.com/en/resources/middleware/body-parser.html
* https://devcenter.heroku.com/articles/local-development-with-docker-compose 
* https://hub.docker.com/_/mongo
* https://docs.mongodb.com/ecosystem/drivers/node/
* https://docs.vernemq.com/plugindevelopment/webhookplugins
* https://docs.vernemq.com/configuration/db-auth#mongodb