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

/**
 * This is the browser entry point for the Optimizely SDK.
 */
import { buildWithPresets } from '@optimizely/optimizely-datafile-manager'
import { createNoOpLogger } from '@optimizely/optimizely-sdk-core/lib/plugins/logger'

import OptimizelyManager from './optimizely_manager'

/**
 * Factory method for constructing the Optimizely manager instance
 * @param {Object} config
 * @param {Object} config.projectId
 * @return {Object} The Optimizely manager instance
 */
export function build(config) {
  const logger = config.logger || createNoOpLogger()

  const datafileManagerInstance = buildWithPresets({
    logger
  })

  const optimizelyManagerInstance = new OptimizelyManager({
    projectId: config.projectId,
    datafileManager: datafileManagerInstance,
    logger
  })

  return optimizelyManagerInstance
}
