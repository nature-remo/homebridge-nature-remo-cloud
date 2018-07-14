const assert = require('assert')
const lib = require('../nature-remo-api')

const token = process.env.NATURE_REMO_CLOUD_TOKEN
const airconId = process.env.NATURE_REMO_AIRCON_ID

describe('NatureRemoAPI', function() {
  describe('#getDevices()', function() {
    it('should return response', async () => {
      const app = new lib(token)
      const response = await app.getDevices()
      console.log(response)
      assert.equal(response[0].name, 'Remo')
    })
  })

  describe('#getAppliances()', function() {
    it('should return response', async () => {
      const app = new lib(token)
      const response = await app.getAppliances()
      console.log(response)
      assert.equal(response[0].device.name, 'Remo')
    })
  })

  describe('#changeAirconSettings()', function() {
    it('should return response', async () => {
      const app = new lib(token)
      const response = await app.changeAirconSettings(airconId, {
        button: 'power-off',
      })
      console.log(response)
      // assert.equal(response[0].device.name, 'Remo')
    })
  })
})
