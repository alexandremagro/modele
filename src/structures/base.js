import _ from 'lodash'
import Modele from '../modele'

export default class Base {
  getURL (route, parameters = {}) {
    const replacements = this._getRouteReplacements(route, parameters)

    return _.reduce(replacements, (result, value = '', parameter) => {
      return _.replace(result, parameter, value)
    }, route)
  }

  send (config, callbacks = {}) {
    return new Promise((resolve, reject) => {
      this._setPending(true)

      // call before callback
      if (callbacks.before) callbacks.before.call(this)

      // merge default config (api) with config
      config = _.merge({}, this.getOption('requestOptions'), config)

      // set URL
      config.url = this.getURL(this._route, this._getRouteParameters({
        [this.getOption('routeParameterURL')]: config.url
      }))

      // send
      return Modele.globals.axios(config)

        // success
        .then((response) => {
          this._setPending(false)
          if (callbacks.success) callbacks.success.call(this, response)
          return resolve(response)
        })

        // failure
        .catch((error) => {
          this._setPending(false)
          if (callbacks.failure) callbacks.failure.call(this, error)
          return reject(error)
        })

        // failure fallback
        .catch((fatal) => {
          this._setPending(false)
          return reject(fatal)
        })
    })
  }

  // states

  pending () {
    return this._pending
  }

  // private

  _getRouteReplacements (route, parameters = {}) {
    const pattern = new RegExp(this.getOption('routeParameterPattern'), 'g')
    const replace = {}
    let parameter

    while ((parameter = pattern.exec(route)) !== null) {
      replace[parameter[0]] = parameters[parameter[1]]
    }

    return replace
  }

  _setPending (value) {
    this._pending = value
  }

  _registerActions () {
    const actions = Object.assign({}, this._defaults.actions, this.actions())

    _.each(actions, (value, attribute) => {
      this._registerAction(attribute, value)
    })
  }

  _registerAction (name, options) {
    // verify is it is'nt aready defined
    if (_.has(this, name)) {
      throw new Error(`Action ${name} cannot be define: Already defined.`)
    }

    // build action
    const value = (callConfig) => {
      const actionConfig = _.isFunction(options.config)
        ? options.config.call(this)
        : options.config

      const config = _.merge({}, actionConfig, callConfig)

      // send request
      return this.send(config, options.callbacks)
    }

    // register
    Object.defineProperty(this, name, { value })
  }
}
