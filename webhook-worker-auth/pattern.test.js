const { isPatternAllowedToPublish, isPatternAllowedToSubscribe } = require('./pattern')

describe('MQTT Pattern match', () => {

  test('Should replace %c, %u and %m variables', () => {
    const deviceInfo = {
      username : 'key',
      clientId : 'DEADBEEF',
      mountpoint : 'devices'
    }
    const pattern = '%m/%c/state/+/%u'
    const topic = 'devices/DEADBEEF/state/test/key'
    expect(isPatternAllowedToPublish(topic, pattern, deviceInfo)).toBe(true)
  })

  test('Should allow to publish to one expansion with +', () => {
    const deviceInfo = {
      clientId : 'DEADBEEF',
    }
    const pattern = 'devices/%c/state/+'
    const topic = 'devices/DEADBEEF/state/temperature'
    expect(isPatternAllowedToPublish(topic, pattern, deviceInfo)).toBe(true)

    const anotherTopic = 'devices/DEADBEEF/state/temperature/unit'
    expect(isPatternAllowedToPublish(anotherTopic, pattern, deviceInfo)).toBe(false)
  })

  test('Should allow to publish to expand with #', () => {
    const deviceInfo = {
      clientId : 'DEADBEEF',
    }
    const pattern = 'devices/%c/state/#'
    const topic = 'devices/DEADBEEF/state/light'
    expect(isPatternAllowedToPublish(topic, pattern, deviceInfo)).toBe(true)

    const anotherTopic = 'devices/DEADBEEF/state/light/color'
    expect(isPatternAllowedToPublish(anotherTopic, pattern, deviceInfo)).toBe(true)
  })

  test('Should allow to subscribe with wildcards', () => {
    const deviceInfo = {
      clientId : 'commander',
    }
    const pattern = 'devices/+/state/#'
    const topic = 'devices/+/state/#'
    expect(isPatternAllowedToSubscribe(topic, pattern, deviceInfo)).toBe(true)

    const anotherTopic = 'devices/DEADBEEF/state/#'
    expect(isPatternAllowedToSubscribe(anotherTopic, pattern, deviceInfo)).toBe(true)
  })

  test('Should allow checks for multiple topics subscriptions', () => {
    const deviceInfo = {
      clientId : 'commander',
    }

    let topics = [
      { topic : 'devices/+/state/#' },
      { topic : 'devices/DEADBEEF/state/#' },
      { topic : 'devices/DEADBEEF/bogus/#' }
    ]

    const pattern = 'devices/+/state/#'

    const checkMatch = (topics, pattern) => {
      return topics.map( ({ topic }) => {
        const match = isPatternAllowedToSubscribe(topic, pattern, deviceInfo)
        if(!match){
          return { topic, qos: 128 }
        }
        return null
      }).filter( t => t !== null)
    }

    let topicsMatch = checkMatch(topics, pattern)
    expect(topicsMatch.length).toBe(1)
    expect(topicsMatch).toContainEqual({ topic : 'devices/DEADBEEF/bogus/#', qos: 128 })

    topics = [
      { topic : 'devices/+/state/#' },
      { topic : 'devices/DEADBEEF/state/#' }
    ]
    topicsMatch = checkMatch(topics, pattern)
    expect(topicsMatch.length).toBe(0)
  })
})