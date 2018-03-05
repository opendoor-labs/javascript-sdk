/**
 * This is the Node entry point for the Optimizely SDK.
 */
import { createLogger } from '@optimizely/optimizely-sdk-core'
import loggerEnums from '@optimizely/optimizely-sdk-core/lib/plugins/logger/enums'
import optimizelyDatafileManagerFactory from '@optimizely/optimizely-datafile-manager'

import OptimizelyManager from './optimizely_manager'

/**
 * Factory method for constructing the optimizely manager instance
 * @param {Object} config
 * @param {Object} config.logger
 * @param {Object} config.projectId
 * @return {Object} The optimizely manager instance
 */
export function build(config) {
  const logger = config.logger || createLogger({
    logLevel: loggerEnums.LOG_LEVEL.DEBUG
  })
  const datafileManagerInstance = optimizelyDatafileManagerFactory.buildWithPresets({
    logger,
  })

  const optimizelyManagerInstance = new OptimizelyManager({
    datafileManager: datafileManagerInstance,
    logger,
    projectId: config.projectId,
  })

  return optimizelyManagerInstance
}
