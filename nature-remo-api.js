const axios = require('axios')
const querystring = require('querystring')

class NatureRemoAPI {
  constructor(token) {
    this.token = token
    this.instance = axios.create({
      baseURL: 'https://api.nature.global',
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      },
    })
  }

  async getDevices() {
    const response = await this.instance.get('/1/devices')
    return response.data
  }

  async getSensorValue() {
    const device = await getDevices()[0]
    return {
      humidity: device.newest_events.hu.value,
      temperature: device.newest_events.te.value,
      illumination: device.newest_events.il.value,
    }
  }

  async getAppliances() {
    const response = await this.instance.get('/1/appliances')
    return response.data
  }

  async getThermostat() {
    const appliances = await this.getAppliances()
    for (const appliance of appliances) {
      if (appliance.type === 'AC') {
        return appliance
      }
    }
    return null
  }

  async updateThermostatSettings(applianceId, settings) {
    const response = await this.instance.post(
      `/1/appliances/${applianceId}/aircon_settings`,
      querystring.stringify(settings)
    )
    return response.data
  }

  async getSignalsForAppliance(applianceId) {
    const response = await this.instance.get(
      `/1/appliances/${applianceId}/signal`
    )
    return response.data
  }
}

module.exports = NatureRemoAPI
