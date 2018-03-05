const DATAFILE_KEY = 'optly-datafile'
const DATAFILE_URL_PATH = 'https://cdn.optimizely.com/json'
const DEFAULT_DATAFILE_DOWNLOAD_INTERVAL = 5000
/**
 * DatafileManager
 * @param {Object} config
 * @param {Object} config.networkClient
 */
class DatafileManager {
  constructor(config) {
    // @TODO: validated the given components against their interfaces
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
      this.logger.log(1, 'Initializing Datafile Manager')
      this.intervalObject = setInterval(() => {
        this.syncDatafile({
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
   * Starts the datafile sync cron job
   * @param  {Object} config
   * @param  {Function} config.onDatafileChange [description]
   * @return {[type]}        [description]
   */
  async syncDatafile(config) {
    try {
      if (this.networkClient) {
        const datafileUrl = `${DATAFILE_URL_PATH}/${this.projectId}.json`

        // Check if datafile has changed
        const { result: responseHeaders, error: fetchHeadError } = await this.networkClient.head(datafileUrl, { method: 'HEAD' })
        const newETag = responseHeaders.get('ETag')

        // No-op since the datafile has not changed
        if (newETag === this.currentETag) {
          this.logger.log(1, 'Datafile has not changed.')

          return
        }
        this.currentETag = newETag

        // Fetch new datafile
        this.logger.log(1, `Fetching Datafile ${datafileUrl}.`)
        const { result: datafile, error } = await this.networkClient.get(datafileUrl, null, { retries: 0 })
        const onDatafileChangeCallback = config.onDatafileChange
        if (datafile && typeof onDatafileChangeCallback === 'function') {
          onDatafileChangeCallback(datafile)
        }
      }
    } catch (error) {
      // log error
      this.logger.log(3, `Error downloading datafile: ${error.message}`)
    }
  }

  stop() {
    clearInterval(this.intervalObject)
  }
}

export default DatafileManager
