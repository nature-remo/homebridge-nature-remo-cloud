// Boilerplate code can be found in homebridge repository.
// https://github.com/nfarina/homebridge/blob/master/example-plugins/homebridge-samplePlatform/index.js
// http://blog.theodo.fr/2017/08/make-siri-perfect-home-companion-devices-not-supported-apple-homekit/
// http://swagger.nature.global/

const NatureRemo = require('./nature-remo')

const PLUGIN_NAME = 'homebridge-nature-remo-cloud'
const ACCESSORY_NAME = 'NatureRemoThermostat'

let Service = null
let Characteristic = null

// Register Nature Remo service to homebridge
module.exports = homebridge => {
  console.log('homebridge API version: ' + homebridge.version)

  // Service and Characteristic are from hap-nodejs
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic

  homebridge.registerAccessory(PLUGIN_NAME, ACCESSORY_NAME, Thermostat, true)
}

// Nature Remo platform
class Thermostat {
  // config may be null
  constructor(log, config) {
    this.log = log
    this.config = config

    this.accessToken = config.accessToken
    this.api = new NatureRemo(this.accessToken)

    // Thermostat Service
    // https://github.com/KhaosT/HAP-NodeJS/blob/9eaea6df40811ccc71664a1ab0c13736e759dac7/lib/gen/HomeKitTypes.js#L3443-L3459
    this.thermostatService = new Service.Thermostat()
    this.thermostatService
      .setCharacteristic(Characteristic.CurrentHeatingCoolingState)
      .on('get', this._getCurrentHeatingCoolingState.bind(this))
      .on('set', this._setCurrentHeatingCoolingState.bind(this))

    this.thermostatService
      .setCharacteristic(Characteristic.TargetHeatingCoolingState)
      .on('get', this._getCurrentHeatingCoolingState.bind(this))

    this.thermostatService
      .setCharacteristic(Characteristic.CurrentTemperature)
      .on('get', this._getCurrentTemperature.bind(this))

    this.thermostatService
      .setCharacteristic(Characteristic.TargetTemperature)
      .on('get', this._getTargetTemperature.bind(this))
      .on('set', this._setTargetTemperature.bind(this))

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

    this.informationService = new Service.AccessoryInformation()
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Nature')
      .setCharacteristic(Characteristic.Model, 'Remo')
      .setCharacteristic(Characteristic.SerialNumber, '031-45-154')
  }

  getServices() {
    return [this.informationService, this.thermostatService]
  }

  async _getCurrentHeatingCoolingState(next) {
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

  async _setCurrentHeatingCoolingState(state, next) {
    this.log('setCurrentHeatingCoolingState', state)
    console.log('setCurrentHeatingCoolingState')
    return next()
  }

  async _getCurrentTemperature(next) {
    this.log('getCurrentTemperature')
    const sensorValue = await this.api.getSensorValue()
    return next(null, sensorValue.temperature)
  }

  async _getTargetTemperature(next) {
    console.log('getTargetTemperature')
    this.log('getTargetTemperature')
    const thermostant = await this.api.getThermostat()
    this.log(thermostat)
    return next(null, thermostat.settings.temp)
  }

  async _setTargetTemperature(state, next) {
    console.log('setTargetTemperature', state)
    this.log('setTargetTemperature', state)
    const thermostat = await this.api.getThermostat()
    await this.api.updateThermostatSettings(thermostat.id, {
      temperature: state,
    })
    return next()
  }
}
