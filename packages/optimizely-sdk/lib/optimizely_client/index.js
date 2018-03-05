import { createInstance } from '@optimizely/optimizely-sdk-core'

class OptimizelyClient {
  /**
   * This serves as a wrapper class around the OptimizelyCore client.
   * If we don't have a valid client instantiated yet then we can
   * just return the default values, null (in most cases).
   *
   * @param  {[type]} config [description]
   * @param  {[type]} config.datafile [description]
   * @param  {[type]} config.logger [description]
   */
  constructor(config) {
    if (!config) {
      return
    }

    this.logger = config.logger
    this.optimizely = createInstance(config)
  }

  activate(experimentKey, userId, userAttributes) {
    if (!this.optimizely) {
      // @TODO: log invalid state
      return null
    }

    return this.optimizely.activate(experimentKey, userId, userAttributes)
  }

  track(eventKey, userId, userAttributes, eventTags) {
    if (!this.optimizely) {
      // @TODO: log invalid state
      return null
    }

    return this.optimizely.track(event, userId, userAttributes, eventTags)
  }

  isFeatureEnabled(featureKey, userId, userAttributes) {
    if (!this.optimizely) {
      // @TODO: log invalid state
      return false
    }

    return this.optimizely.isFeatureEnabled(featureKey, userId, userAttributes)
  }
}

export default OptimizelyClient
