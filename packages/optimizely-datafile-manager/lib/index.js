import OptimizelyNetworkClient from '@optimizely/optimizely-network-client'

import DatafileManager from './datafile_manager'

export function build(config) {
  return new DatafileManager(config)
}

export function buildWithPresets(config = {}) {
  if (!config.networkClient) {
    config.networkClient = new OptimizelyNetworkClient({
      logger: config.logger
    })
  }

  return build(config)
}

export default {
  build,
  buildWithPresets
}
