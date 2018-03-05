import loggerEnums from '@optimizely/optimizely-sdk-core/lib/plugins/logger/enums'

import OptimizelyClient from '../optimizely_client'

/**
 * OptimizelyManager
 * Manages the Opimizely Client instance as well as the Datafile Manager
 */
class OptimizelyManager {
  /**
   * OptimizelyManager constructor
   * @param  {Object} config
   * @param  {Object} config.logger
   */
  constructor(config) {
    this.projectId = config.projectId
    this.datafileManager = config.datafileManager
    this.logger = config.logger
    this.initialized = false

    // instantiate a default dummy instance of the client
    this.optimizelyClient = new OptimizelyClient()
  }

  /**
   * Initializes the manager
   * @param {Object} config
   * @param {Object} config.datafile
   * @param {Function} config.onInitialize
   */
  initialize(config = {}) {
    this.logger.log(loggerEnums.LOG_LEVEL.DEBUG, "Initializing Optimizely Manager")
    this.optimizelyClientConfig = {
      logger: this.logger,
      datafile: config.datafile
    }

    this.datafileManager.initialize({
      logger: this.logger,
      projectId: this.projectId,
      onDatafileChange: (datafile) => {
        this.optimizelyClient = new OptimizelyClient({
          ...this.optimizelyClientConfig,
          datafile,
        })

        if (!this.initialized) {
          if (typeof config.onInitialize === 'function') {
            config.onInitialize(this.optimizelyClient)
          }
          this.initialized = true
        }
      }
    })
  }

  /**
   * Retrieves the optimizely client instance
   * @return {Object}
   */
  getClient() {
    return this.optimizelyClient
  }
}

export default OptimizelyManager
