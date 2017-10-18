import absence from './rules/absence'
import acceptance from './rules/acceptance'
import confirmation from './rules/confirmation'
import exclusion from './rules/exclusion'
import format from './rules/format'
import inclusion from './rules/inclusion'
import length from './rules/length'
import presence from './rules/presence'

import Errors from './errors'

const DEFAULTS = {
  absence,
  acceptance,
  confirmation,
  exclusion,
  format,
  inclusion,
  length,
  presence
}

export default class Validator {
  constructor (config = {}) {
    this.ruleBook = config.ruleBook || DEFAULTS
    this.rules = {}
  }

  /*
    @param {string} key - name of rule un ruleBook
    @param {string} prop - prop name that will be validate
    @param {Object} [options] - rule options
  */
  addRule (key, prop, options) {
    if (!this.ruleBook[key]) {
      throw new TypeError(`Rule ${key} not found`)
    }

    const rule = new this.ruleBook[key](options)

    if (!this.rules[prop]) {
      this.rules[prop] = []
    }

    this.rules[prop].push(rule)
  }

  validate (record, prop) {
    const errors = new Errors()

    this.rules[prop].forEach(rule => {
      errors.merge(rule.validate(record, prop))
    })

    return errors
  }

  validateAll (record) {
    const errors = new Errors()

    Object.keys(this.rules).forEach(prop => {
      errors.merge(this.validate(record, prop))
    })

    return errors
  }
}
