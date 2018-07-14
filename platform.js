// Boilerplate code can be found in homebridge repository.
// https://github.com/nfarina/homebridge/blob/master/example-plugins/homebridge-samplePlatform/index.js
//
// Thermostat Service
// https://github.com/KhaosT/HAP-NodeJS/blob/9eaea6df40811ccc71664a1ab0c13736e759dac7/lib/gen/HomeKitTypes.js#L3443-L3459

const NatureRemoAPI = require('./nature-remo')

let Accessory, Service, Characteristic, UUIDGen

// Register Nature Remo service to homebridge
module.exports = function(homebridge) {
  console.log('homebridge API version: ' + homebridge.version)

  // Accessory must be created from PlatformAccessory Constructor
  Accessory = homebridge.platformAccessory

  // Service and Characteristic are from hap-nodejs
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  UUIDGen = homebridge.hap.uuid

  homebridge.registerPlatform(
    'homebridge-nature-remo-cloud',
    'Nature Remo',
    NatureRemoPlatform,
    true
  )
}

// Nature Remo platform
class NatureRemoPlatform {
  // config may be null
  constructor(log, config, api) {
    this.log = log
    this.config = config
    this.accessories = []
    this.accessToken = config.accessToken
    this.natureRemoAPI = new NatureRemoAPI(this.accessToken)

    if (api) {
      this.api = api
      this.api.on('didFinishLaunching', () => {
        this.log('DidFinishLaunching')
      })
    }
  }

  // Function invoked when homebridge tries to restore cached accessory.
  // Developer can configure accessory at here (like setup event handler).
  // Update current value.
  // Homebridgeがキャッシュからアクセサリーを復帰する時に呼び出されます。
  // 開発者はここで（セットアップイベントハンドラーでするように）アクセサリーを設定することが出来ます。
  // 現在の値を更新します。
  configureAccessory(accessory) {
    this.log(accessory.displayName, 'Configure Accessory')

    // Set the accessory to reachable if plugin can currently process the accessory,
    // otherwise set to false and update the reachability later by invoking
    // accessory.updateReachability()
    accessory.reachable = true

    accessory.on('identify', (paired, callback) => {
      this.log(accessory.displayName, 'Identify!!!')
      callback()
    })

    if (accessory.getService(Service.Thermostat)) {
      accessory
        .getService(Service.Thermostat)
        .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
        .on('set', (value, callback) => {
          this.log(accessory.displayName, 'Light -> ' + value)
          callback()
        })
    }

    this.accessories.push(accessory)
  }

  // Handler will be invoked when user try to config your plugin.
  // Callback can be cached and invoke when necessary.
  // ユーザーがプラグインの設定を変更しようとした時に呼ばれます。
  // コールバックはキャッシュされ、必要な時に呼び出されます。
  configurationRequestHandler(context, request, callback) {
    this.log('Context:', JSON.stringify(context))
    this.log('Request:', JSON.stringify(request))

    if (
      request &&
      request.response &&
      request.response.inputs &&
      request.response.inputs.name
    ) {
      this.addAccessory(request.response.inputs.name)

      // Invoke callback with config will let homebridge save the new config into config.json
      // Callback = function(response, type, replace, config)
      // set "type" to platform if the plugin is trying to modify platforms section
      // set "replace" to true will let homebridge replace existing config in config.json
      // "config" is the data platform trying to save
      callback(null, 'platform', true, {
        platform: 'Nature Remo',
        otherConfig: 'SomeData',
      })
      return
    }

    var respDict = {
      type: 'Interface',
      interface: 'input',
      title: 'Add Accessory',
      items: [
        {
          id: 'name',
          title: 'Name',
          placeholder: 'Fancy Light',
        }, //,
        // {
        //   "id": "pw",
        //   "title": "Password",
        //   "secure": true
        // }
      ],
    }

    context.ts = 'Hello'

    // Invoke callback to update setup UI
    callback(respDict)
  }

  // Sample function to show how developer can add accessory dynamically from outside event
  addAccessory() {
    this.log('Add Accessory')
    var platform = this
    var uuid

    uuid = UUIDGen.generate(accessoryName)

    var newAccessory = new Accessory(accessoryName, uuid)
    newAccessory.on('identify', function(paired, callback) {
      platform.log(newAccessory.displayName, 'Identify!!!')
      callback()
    })
    // Plugin can save context on accessory to help restore accessory in configureAccessory()
    // newAccessory.context.something = "Something"

    // Make sure you provided a name for service, otherwise it may not visible in some HomeKit apps
    newAccessory
      .addService(Service.Lightbulb, 'Test Light')
      .getCharacteristic(Characteristic.On)
      .on('set', function(value, callback) {
        platform.log(newAccessory.displayName, 'Light -> ' + value)
        callback()
      })

    this.accessories.push(newAccessory)
    this.api.registerPlatformAccessories(
      'homebridge-samplePlatform',
      'SamplePlatform',
      [newAccessory]
    )
  }

  getServices() {
    this.log(`start homebridge Server ${this.name}`)

    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Nature')
      .setCharacteristic(Characteristic.Model, 'Remo')
      .setCharacteristic(Characteristic.SerialNumber, '031-45-154')

    this.humiditySensorService
      .getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .on('get', this.getHumidity.bind(this))

    this.temperatureSensorService
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on('get', this.getTemperature.bind(this))

    return [
      this.informationService,
      this.humiditySensorService,
      this.temperatureSensorService,
    ]
  }
}
