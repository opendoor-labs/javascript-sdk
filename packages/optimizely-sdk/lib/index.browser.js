/**
 * This is the browser entry point for the Optimizely SDK.
 */
import optimizelyDatafileManagerFactory from '@optimizely/optimizely-datafile-manager'

import OptimizelyManager from './optimizely_manager'

/**
 * [build description]
 * @param {Object} config
 * @param {Object} config.projectId
 * @return {[type]} [description]
 */
export function build(config) {
  const datafileManagerInstance = optimizelyDatafileManagerFactory.buildWithPresets()

  const optimizelyManagerInstance = new OptimizelyManager({
    projectId: config.projectId,
    datafileManager: datafileManagerInstance
  })

  return optimizelyManagerInstance
}
