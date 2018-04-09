/****************************************************************************
 * Copyright 2018, Optimizely, Inc. and contributors                        *
 *                                                                          *
 * Licensed under the Apache License, Version 2.0 (the "License");          *
 * you may not use this file except in compliance with the License.         *
 * You may obtain a copy of the License at                                  *
 *                                                                          *
 *    http://www.apache.org/licenses/LICENSE-2.0                            *
 *                                                                          *
 * Unless required by applicable law or agreed to in writing, software      *
 * distributed under the License is distributed on an "AS IS" BASIS,        *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *
 * See the License for the specific language governing permissions and      *
 * limitations under the License.                                           *
 ***************************************************************************/

import OptimizelyNetworkClient from '@optimizely/optimizely-network-client'
import { createLogger } from '@optimizely/optimizely-sdk-core/lib/plugins/logger'
import { LOG_LEVEL } from '@optimizely/optimizely-sdk-core/lib/utils/enums'

import DatafileManager from './datafile_manager.browser'

/**
 * Factory method for constructing the datafile manager instance
 * @param {Object} config
 * @param {Object} config.logger
 * @param {Object} config.networkClient
 */
export function build(config) {
  return new DatafileManager(config)
}

/**
* Factory method for constructing the datafile manager instance with presets
 * @param {Object} config
 * @param {Object} config.logger
 * @param {Object} config.networkClient
 */
export function buildWithPresets(config = {}) {
  if (!config.logger) {
    config.logger = createLogger({ logLevel: LOG_LEVEL.DEBUG })
  }

  if (!config.networkClient) {
    config.networkClient = new OptimizelyNetworkClient({
      logger: config.logger
    })
  }

  return build(config)
}
