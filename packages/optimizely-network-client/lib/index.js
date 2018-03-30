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

import 'isomorphic-unfetch'
import { LOG_LEVEL } from '../../optimizely-sdk-core/lib/utils/enums'
// import { LOG_LEVEL } from '@optimizely/optimizely-sdk-core'

const BASE_GET_HEADERS = {
  'content-type': 'application/json'
}

const BASE_POST_HEADERS = {
  'content-type': 'application/json'
}

/**
 * Networking client for POST and GET requests
 */
export default class OptimizelyNetworkClient {
  /**
   * Default constructor
   * @param {Object} config
   * @param {Object} config.logger
   */
  constructor(config) {
    // @TODO: check that logger is defined
    this.logger = config.logger
  }

  /**
   * Executes a HTTP GET request with the given config params
   * @param {String} url
   * @param {Object} config
   * @param {Object} config.headers
   * @param {Object} options
   * @return {Promise}
   */
  async get(url, config = {}, options = {}) {
    // @TODO: implement options
    try {
      if (!url) {
        return {
          error: {
            message: 'Please provide a URL.'
          }
        }
      }
      this.logger.log(LOG_LEVEL.DEBUG, `Executing GET request for ${url}`)

      const headers = Object.assign({}, BASE_GET_HEADERS, config.headers)
      const fetchConfig = Object.assign({}, config, {
        headers: headers,
        method: 'GET'
      })

      const response = await fetch(url, fetchConfig)
      // @TODO: handle response not OK?
      if (response.ok) {
        return {
          result: {
            body: await response.json(),
            headers: {
              etag: response.headers.get('etag')
            },
            status: response.status
          }
        }
      }
    } catch (error) {
      this.logger.log(LOG_LEVEL.WARNING,
        `Unable to fetch ${url}: ${error.message}`)
      return {
        error
      }
    }
  }

  /**
   * Executes a HTTP POST request with the given config params
   * @param {String} url
   * @param {Object} config
   * @param {Object} options
   * @return {Promise}
   */
  post(url, config, options) {
    // @TODO
  }
}
