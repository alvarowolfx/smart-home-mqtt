
const mqttRegex = require('mqtt-regex')

function fillPattern(pattern, { username, mountpoint, clientId }){
  return pattern
    .replace('%u', username || "")
    .replace('%c', clientId || "")
    .replace('%m', mountpoint || "")
}

function isPatternAllowedToPublish(topic, pattern, acl ){
  const filledPattern = fillPattern(pattern, acl)
  const results = mqttRegex(filledPattern).exec(topic)
  return !!results
}

function isPatternAllowedToSubscribe(topic, pattern, acl ){
  const filledPattern = fillPattern(pattern, acl)
  const results = mqttRegex(filledPattern).exec(topic)
  return !!results
}

module.exports = {
  isPatternAllowedToPublish,
  isPatternAllowedToSubscribe
}