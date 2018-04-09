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

import { LOG_LEVEL, HTTP_STATUS_CODES } from '@optimizely/optimizely-sdk-core/lib/utils/enums'

const DATAFILE_URL_PATH = 'https://cdn.optimizely.com/json'

/**
 * DatafileManager
 */
export default class DatafileManager {
  /**
   * Default constructor
   * @param {Object} config
   * @param {Object} config.logger
   * @param {Object} config.networkClient
   */
  constructor(config) {
    // @TODO: validate the given components against their interfaces
    // @NOTE: logger and networkClient are required
    this.logger = config.logger
    this.networkClient = config.networkClient
  }

  /**
   * Initialize the manager and download datafile
   * @param  {Object}   config
   * @param  {String}   config.projectId
   * @param  {Object}   config.datafile
   * @param  {Function} config.onDatafileChange
   * @return {Promise}
   */
  async initialize({ projectId, datafile, onDatafileChange }) {
    // @TODO: implement initialize with datafile

    try {
      if (!projectId) {
        this.logger.log(LOG_LEVEL.WARNING,
          'Unable to initialize datafile manager without project ID')
        return
      }

      this.logger.log(LOG_LEVEL.DEBUG, 'Initializing datafile manager')
      this.projectId = projectId
      this.datafileUrl = `${DATAFILE_URL_PATH}/${this.projectId}.json`

      // Download the datafile
      this.downloadDatafile({ onDatafileChange })
    } catch (error) {
      // @TODO: log error
    }
  }

  /**
   * Download datafile and check for updates
   * @param  {Object}   config
   * @param  {Function} config.onDatafileChange
   */
  async downloadDatafile(config = {}) {
    if (!this.datafileUrl) {
      this.logger.log(LOG_LEVEL.WARNING,
        'Unable to download datafile before initializing the datafile manager')
      return
    }

    try {
      this.logger.log(LOG_LEVEL.DEBUG,
        `Downloading datafile: ${this.datafileUrl}`)

      const { result: fetchResult, error: fetchError } =
        await this.networkClient.get(this.datafileUrl)

      if (fetchResult.status === HTTP_STATUS_CODES.OK) {
        // Downloaded a new datafile
        this.currentETag = fetchResult.headers.etag
        this.logger.log(LOG_LEVEL.DEBUG,
          `Downloaded new datafile (ETag: ${this.currentETag})`)

        const datafile = fetchResult.body;
        const onDatafileChangeCallback = config.onDatafileChange
        if (datafile && typeof onDatafileChangeCallback === 'function') {
          onDatafileChangeCallback(datafile)
        }
      } else {
        // @TODO handle other status codes
      }
    } catch (error) {
      this.logger.log(LOG_LEVEL.WARNING,
        `Unable to download datafile ${this.datafileUrl}: ${error.message}`)
    }
  }

  /**
   * Stop polling for datafile updates
   */
  stop() {
    // no-op in browser
  }
}
