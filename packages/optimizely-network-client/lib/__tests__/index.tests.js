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

import { assert, expect } from 'chai'
import fetchMock from 'fetch-mock'
import sinon from 'sinon'

import { LOG_LEVEL, HTTP_STATUS_CODES } from '../../../optimizely-sdk-core/lib/utils/enums'
// import { LOG_LEVEL, HTTP_STATUS_CODES } from '@optimizely/optimizely-sdk-core'
import OptimizelyLogger from '../../../optimizely-sdk-core/lib/plugins/logger'
// import { createLogger } from '@optimizely/optimizely-sdk-core'
import OptimizelyNetworkClient from '../'

const logger = OptimizelyLogger.createLogger({ logLevel: LOG_LEVEL.DEBUG })
const loggerStub = sinon.stub(logger, 'log')
const client = new OptimizelyNetworkClient({ logger })

const ETAG1 = '0123456789'
const ETAG2 = 'abcdefghij'
const FETCH_ERROR = new Error('request failed')
const FETCH_HEADERS = {
  'If-None-Match': 'abcd0123'
}
const RESPONSE_BODY = {
  test: 'data'
}
const RESULT = {
  body: RESPONSE_BODY,
  headers: {
    etag: ETAG1
  },
  status: HTTP_STATUS_CODES.OK
}

const TEST_URL = 'http://www.example.com'
const ERROR_URL = 'http://www.error.com'

describe('optimizely-network-client', () => {
  describe('index', () => {
    afterEach(() => {
      fetchMock.restore()
      loggerStub.resetHistory()
    })

    describe('constructor', () => {
      xit('should ...', () => {})
    })

    describe('get', () => {
      beforeEach(() => {
        fetchMock.get(TEST_URL, {
          body: JSON.stringify(RESPONSE_BODY),
          headers: {
            etag: ETAG1
          }
        })
        fetchMock.get(ERROR_URL, {
          throws: FETCH_ERROR
        })
      })

      it('should return an error if URL is missing', async () => {
        const response = await client.get()
        expect(response).to.deep.equal({
          error: {
            message: 'Please provide a URL.'
          }
        })
      })

      it('should fetch URL using GET method', async () => {
        const response = await client.get(TEST_URL)
        expect(response).to.deep.equal({
          result: RESULT
        })
        expect(fetchMock.lastOptions(TEST_URL, 'GET')).to.deep.equal({
          headers: {
            'content-type': 'application/json'
          },
          method: 'GET'
        })
        expect(loggerStub.calledOnce).to.be.true
        expect(loggerStub.getCall(0).args[0]).to.equal(LOG_LEVEL.DEBUG)
      })

      it('should fetch URL using GET method with headers', async () => {
        const fetchConfig = {
          headers: FETCH_HEADERS
        }
        const response = await client.get(TEST_URL, fetchConfig)
        expect(response).to.deep.equal({
          result: RESULT
        })
        expect(fetchMock.lastOptions(TEST_URL, 'GET')).to.deep.equal({
          headers: Object.assign({
            'content-type': 'application/json'
          }, FETCH_HEADERS),
          method: 'GET'
        })
        expect(loggerStub.calledOnce).to.be.true
        expect(loggerStub.getCall(0).args[0]).to.equal(LOG_LEVEL.DEBUG)
      })

      it('should return an error when fetch fails', async () => {
        const response = await client.get(ERROR_URL)
        expect(response).to.deep.equal({
          error: FETCH_ERROR
        })
        expect(fetchMock.lastOptions(ERROR_URL, 'GET')).to.deep.equal({
          headers: {
            'content-type': 'application/json'
          },
          method: 'GET'
        })
        expect(loggerStub.calledTwice).to.be.true
        expect(loggerStub.getCall(0).args[0]).to.equal(LOG_LEVEL.DEBUG)
        expect(loggerStub.getCall(1).args[0]).to.equal(LOG_LEVEL.WARNING)
        expect(loggerStub.getCall(1).args[1]).to.equal(
          `Unable to fetch ${ERROR_URL}: ${FETCH_ERROR.message}`)
      })
    })

    describe('post', () => {
      beforeEach(() => {
        fetchMock.post(TEST_URL, JSON.stringify(RESPONSE))
        fetchMock.post(ERROR_URL, {
          throws: FETCH_ERROR
        })
      })

      xit('should ...', () => {})
    })
  })
})
