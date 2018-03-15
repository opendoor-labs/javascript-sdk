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

import { LOG_LEVEL, HTTP_STATUS_CODES } from '../../optimizely-sdk-core/lib/utils/enums'
// import { LOG_LEVEL, HTTP_STATUS_CODES } from '@optimizely/optimizely-sdk-core'

const DATAFILE_KEY = 'optly-datafile'
const DATAFILE_URL_PATH = 'https://cdn.optimizely.com/json'
const DEFAULT_DATAFILE_DOWNLOAD_INTERVAL = 5000

/**
 * DatafileManager
 */
export default class DatafileManager {
  /**
   * Default constructor
   * @param {Object} config
   * @param {Object} config.logger
   * @param {Object} config.networkClient
   * @param {Object} config.storageClient
   */
  constructor(config) {
    // @TODO: validate the given components against their interfaces
    // @NOTE: logger and networkClient are required
    this.logger = config.logger
    this.networkClient = config.networkClient
    this.storageClient = config.storageClient
  }

  /**
   * Initializes the manager and returns the datafile once we have it.
   * @param  {Object}   config
   * @param  {String}   config.projectId
   * @param  {Object}   config.datafile
   * @param  {int}      config.downloadInterval
   * @param  {Function} config.onDatafileChange
   * @return {Promise}
   */
  async initialize({ projectId, datafile, downloadInterval = DEFAULT_DATAFILE_DOWNLOAD_INTERVAL, onDatafileChange }) {
    try {
      this.projectId = projectId

      // Start the sync job at the specified interval
      this.logger.log(LOG_LEVEL.DEBUG, 'Initializing Datafile Manager')
      this.intervalObject = setInterval(() => {
        this.downloadDatafile({
          onDatafileChange,
        })
      }, downloadInterval)
    } catch (error) {
      // @TODO: log error
    }
  }

  async getStoredDatafile() {
    try {
      if (this.storageClient) {
        const storedDatafile = await storageClient.get(`${DATAFILE_KEY}-${this.projectId}`)
        if (storedDatafile) {
          return {
            datafile: storedDatafile
          }
        }
      }
      return {
        datafile: null
      }
    } catch (error) {
      // @TODO: log error
      return {
        error
      }
    }
  }

  /**
   * Download datafile and check for updates
   * @param  {Object}   config
   * @param  {Function} config.onDatafileChange
   */
  async downloadDatafile(config = {}) {
    if (!this.projectId) {
      this.logger.log(LOG_LEVEL.WARNING,
        `Unable to download datafile because project ID is missing`)
      return
    }

    const datafileUrl = `${DATAFILE_URL_PATH}/${this.projectId}.json`
    try {
      // Send ETag if available
      const headers = {}
      if (this.currentETag) {
        this.logger.log(LOG_LEVEL.DEBUG,
          `Downloading datafile: ${datafileUrl} (ETag: ${this.currentETag})`)
        headers['If-None-Match'] = this.currentETag
      } else {
        this.logger.log(LOG_LEVEL.DEBUG,
          `Downloading datafile: ${datafileUrl}`)
      }

      const { result: fetchResult, error: fetchError } =
        await this.networkClient.get(datafileUrl, { headers })

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
      } else if (fetchResult.status === HTTP_STATUS_CODES.NOT_MODIFIED) {
        // Datafile has not changed
        this.logger.log(LOG_LEVEL.DEBUG, `Datafile has not changed`)
      } else {
        // @TODO handle other status codes
      }
    } catch (error) {
      this.logger.log(LOG_LEVEL.WARNING,
        `Unable to download datafile ${datafileUrl}: ${error.message}`)
    }
  }

  /**
   * Stop polling for datafile updates
   */
  stop() {
    if (this.intervalObject) {
      this.logger.log(LOG_LEVEL.DEBUG,
        `Stop checking for datafile updates: ${datafileUrl}`)
      clearInterval(this.intervalObject)
      this.intervalObject = null
    }
  }
}
