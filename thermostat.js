// Boilerplate code can be found in homebridge repository.
// https://github.com/nfarina/homebridge/blob/master/example-plugins/homebridge-samplePlatform/index.js
// http://blog.theodo.fr/2017/08/make-siri-perfect-home-companion-devices-not-supported-apple-homekit/
// http://swagger.nature.global/

const NatureRemoAPI = require('./nature-remo-api')

let Service, Characteristic

// Register Nature Remo service to homebridge
module.exports = homebridge => {
  console.log('homebridge API version: ' + homebridge.version)

  // Service and Characteristic are from hap-nodejs
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic

  homebridge.registerAccessory(
    'homebridge-nature-remo-cloud',
    'NatureRemoThermostat',
    NatureRemoThermostat,
    true
  )
}

// Nature Remo platform
class NatureRemoThermostat {
  // config may be null
  constructor(log, config) {
    this.log = log
    this.config = config

    this.accessToken = config.accessToken
    this.api = new NatureRemoAPI(this.accessToken)

    // services
    this.informationService = new Service.AccessoryInformation()
    this.thermostatService = new Service.Thermostat()
  }

  getServices() {
    // Thermostat Service
    // https://github.com/KhaosT/HAP-NodeJS/blob/9eaea6df40811ccc71664a1ab0c13736e759dac7/lib/gen/HomeKitTypes.js#L3443-L3459

    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Nature')
      .setCharacteristic(Characteristic.Model, 'Remo')
      .setCharacteristic(Characteristic.SerialNumber, '031-45-154')

    this.thermostatService
      .setCharacteristic(Characteristic.CurrentHeatingCoolingState)
      .on('get', this.getCurrentHeatingCoolingState.bind(this))
      .on('set', (state, next) => {
        this.log('Yay!', state, next)
        this.setCurrentHeatingCoolingState(state, next)
      })

    this.thermostatService
      .setCharacteristic(Characteristic.TargetHeatingCoolingState)
      .on('get', this.getCurrentHeatingCoolingState.bind(this))

    this.thermostatService
      .setCharacteristic(Characteristic.CurrentTemperature)
      .on('get', this.getCurrentTemperature.bind(this))

    this.thermostatService
      .setCharacteristic(Characteristic.TargetTemperature)
      .on('get', this.getTargetTemperature.bind(this))
      .on('set', this.setTargetTemperature.bind(this))

    this.thermostatService.setCharacteristic(
      Characteristic.TemperatureDisplayUnits,
      Characteristic.TemperatureDisplayUnits.CELSIUS
    )
    // Optional Characteristics
    // .setCharacteristic(Characteristic.CurrentRelativeHumidity)
    // .setCharacteristic(Characteristic.TargetRelativeHumidity)
    // .setCharacteristic(Characteristic.CoolingThresholdTemperature)
    // .setCharacteristic(Characteristic.HeatingThresholdTemperature)
    // .setCharacteristic(Characteristic.Name)

    return [this.informationService, this.thermostatService]
  }

  identify(next) {
    this.log('Identify requested!')
    next(null)
  }

  async getCurrentHeatingCoolingState(next) {
    this.log('getCurrentHeatingCoolingState')
    const thermostat = await this.api.getThermostat()
    const { mode, button } = thermostat.settings

    // thermostat state: '' = on, 'power-off' = off
    if (button === '') {
      return next(null, Characteristic.CurrentHeatingCoolingState.OFF)
    }

    const modeMap = {
      warm: Characteristic.CurrentHeatingCoolingState.HEAT,
      dry: Characteristic.CurrentHeatingCoolingState.COOL,
      cool: Characteristic.CurrentHeatingCoolingState.COOL,
    }

    if (Object.keys(modeMap).indexOf(mode)) {
      return next(null, modeMap[mode])
    }
  }

  setCurrentHeatingCoolingState(state, next) {
    this.log('setCurrentHeatingCoolingState', state)
    console.log('setCurrentHeatingCoolingState')
    return next()
  }

  async getCurrentTemperature(next) {
    this.log('getCurrentTemperature')
    const sensorValue = await this.api.getSensorValue()
    return next(null, sensorValue.temperature)
  }

  getTargetTemperature(next) {
    console.log('getTargetTemperature')
    this.log('getTargetTemperature')
    this.api.getThermostat().then(thermostant => {
      this.log(thermostat)
      return next(null, thermostat.settings.temp)
    })
  }

  async setTargetTemperature(state, next) {
    console.log('setTargetTemperature', state)
    this.log('setTargetTemperature', state)
    const thermostat = await this.api.getThermostat()
    await this.api.updateThermostatSettings(thermostat.id, {
      temperature: state,
    })
    return next()
  }
}
