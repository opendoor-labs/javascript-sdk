import fetch from 'isomorphic-unfetch'

const BASE_GET_HEADERS = {
  'content-type': 'application/json'
}

const BASE_HEAD_HEADERS = {
  'content-type': 'application/json'
}

const BASE_POST_HEADERS = {
  'content-type': 'application/json'
}

/**
 * Networking client for POST and GET requests
 * @param {[type]} logger [description]
 */
class OptimizelyNetworkClient {
  constructor(config) {
    this.logger = config.logger
  }

  /**
   * Executes a HTTP HEAD request with the given config params
   * @param  {String} url     [description]
   * @param  {Object} config  [description]
   * @param  {Object} options [description]
   * @return {Promise} Containing the Headers{} object for the response
   */
  async head(url, config = {}, options) {
    try {
      this.logger.log(1, `Fetching HEAD for ${url}`)
      if (!url) {
        return {
          error: {
            message: 'Please provide a URL.'
          }
        }
      }

      const fetchConfig = {
        headers: BASE_HEAD_HEADERS,
        method: 'HEAD',
        ...config
      }

      const response = await fetch(url, fetchConfig)
      if (response.ok) {
        this.logger.log(1, `HEAD FETCH for ${url} successful`)
        return {
          result: response.headers
        }
      } else {
        // @TODO: log and return error
      }
    } catch (error) {
      this.logger.log(3, `Error executing HEAD FETCH for ${url}: ${error.message}`)
      // @TODO: log error
      return {
        error
      }
    }
  }

  /**
   * Executes a HTTP GET request with the given config params
   * @param {String} url
   * @param {Object} config
   * @param {Object} options
   * @return {Promise}
   */
  async get(url, config = {}, options) {
    try {
      if (!url) {
        return {
          error: {
            message: 'Please provide a URL.'
          }
        }
      }
      this.logger.log(1, `Executing GET request for ${url}`)

      const fetchConfig = {
        headers: BASE_GET_HEADERS,
        method: 'GET',
        ...config
      }

      const response = await fetch(url, fetchConfig)
      if (response.ok) {
        const datafile = await response.json()
        return {
          result: datafile
        }
      }
    } catch(error) {
      // @TODO: log error
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

  }
}

export default OptimizelyNetworkClient
