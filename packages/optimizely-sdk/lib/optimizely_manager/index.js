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

import { LOG_LEVEL } from '@optimizely/optimizely-sdk-core/lib/utils/enums'

import OptimizelyClient from '../optimizely_client'

/**
 * OptimizelyManager
 * Manages the Opimizely Client instance as well as the Datafile Manager
 */
export default class OptimizelyManager {
  /**
   * OptimizelyManager constructor
   * @param  {Object} config
   * @param  {Object} config.datafileManager
   * @param  {Object} config.logger
   * @param  {String} config.projectId
   */
  constructor(config) {
    this.initialized = false
    this.datafileManager = config.datafileManager
    this.logger = config.logger
    this.projectId = config.projectId

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
    this.logger.log(LOG_LEVEL.DEBUG, 'Initializing Optimizely Manager')

    this.datafileManager.initialize({
      projectId: this.projectId,
      datafile: config.datafile,
      onDatafileChange: (datafile) => {
        this.optimizelyClient = new OptimizelyClient({
          datafile,
          logger: this.logger
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
   * Retrieves the Optimizely client instance
   * @return {Object}
   */
  getClient() {
    return this.optimizelyClient
  }
}
