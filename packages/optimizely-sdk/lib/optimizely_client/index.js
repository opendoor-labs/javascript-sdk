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

import { createInstance } from '@optimizely/optimizely-sdk-core'

export default class OptimizelyClient {
  /**
   * This serves as a wrapper class around the OptimizelyCore client.
   * If we don't have a valid client instantiated yet then we can
   * just return the default values, null (in most cases).
   *
   * @param  {Object} config
   * @param  {Object} config.datafile
   * @param  {Object} config.logger
   */
  constructor(config) {
    if (!config) {
      // dummy instance
      return
    }

    this.logger = config.logger
    this.optimizely = createInstance(config)
  }

  activate(experimentKey, userId, userAttributes) {
    if (!this.optimizely) {
      // @TODO log invalid state (logger unavailable)
      return null
    }

    return this.optimizely.activate(experimentKey, userId, userAttributes)
  }

  track(eventKey, userId, userAttributes, eventTags) {
    if (!this.optimizely) {
      // @TODO log invalid state (logger unavailable)
      return null
    }

    return this.optimizely.track(event, userId, userAttributes, eventTags)
  }

  isFeatureEnabled(featureKey, userId, userAttributes) {
    if (!this.optimizely) {
      // @TODO log invalid state (logger unavailable)
      return false
    }

    return this.optimizely.isFeatureEnabled(featureKey, userId, userAttributes)
  }
}
