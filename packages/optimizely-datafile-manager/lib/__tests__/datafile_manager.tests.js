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
import sinon from 'sinon'

import { LOG_LEVEL, HTTP_STATUS_CODES } from '../../../optimizely-sdk-core/lib/utils/enums'
// import { LOG_LEVEL, HTTP_STATUS_CODES } from '@optimizely/optimizely-sdk-core'
import OptimizelyDatafileManager from '../datafile_manager'
import OptimizelyLogger from '../../../optimizely-sdk-core/lib/plugins/logger'
// import { createLogger } from '@optimizely/optimizely-sdk-core'
import OptimizelyNetworkClient from '../../../optimizely-network-client/lib'
// import { OptimizelyNetworkClient } from '@optimizely/optimizely-network-client'

const logger = OptimizelyLogger.createLogger({ logLevel: LOG_LEVEL.DEBUG })
const loggerStub = sinon.stub(logger, 'log')
const networkClient = new OptimizelyNetworkClient({ logger })
const networkClientGetStub = sinon.stub(networkClient, 'get')
const onDatafileChangeCallback = sinon.spy()

const DATAFILE = {
  a: 1,
  b: 2
}
const ETAG1 = '0123456789'
const ETAG2 = 'abcdefghij'
const PROJECT_ID = 123
const DATAFILE_KEY = `optly-datafile-${PROJECT_ID}`
const DATAFILE_URL = `https://cdn.optimizely.com/json/${PROJECT_ID}.json`
const DEFAULT_DATAFILE_DOWNLOAD_INTERVAL = 5000
const CUSTOM_DATAFILE_DOWNLOAD_INTERVAL = 10000

describe('optimizely-datafile-manager', () => {
  describe('datafile_manager', () => {
    afterEach(() => {
      loggerStub.reset()
      networkClientGetStub.reset()
      onDatafileChangeCallback.resetHistory()
    })

    describe('constructor', () => {
      // @TODO: implement tests
      xit('should ...', () => {})
    })

    describe('initialize', () => {
      let clock;

      beforeEach(() => {
        clock = sinon.useFakeTimers()
      })

      afterEach(() => {
        clock.restore()
      })

      it('should log a warning if project ID is missing', async () => {
        const manager = new OptimizelyDatafileManager({ logger })
        await manager.initialize({})
        expect(loggerStub.calledOnce).to.be.true
        expect(loggerStub.getCall(0).args[0]).to.equal(LOG_LEVEL.WARNING)
        expect(loggerStub.getCall(0).args[1]).to.equal('Unable to initialize datafile manager without project ID')
      })

      it('should start datafile sync with default interval', async () => {
        const manager = new OptimizelyDatafileManager({ logger })
        const downloadDatafileStub = sinon.stub(manager, 'downloadDatafile')
        await manager.initialize({
          projectId: PROJECT_ID
        })
        expect(manager.projectId).to.equal(PROJECT_ID)
        expect(manager.datafileKey).to.equal(DATAFILE_KEY)
        expect(manager.datafileUrl).to.equal(DATAFILE_URL)
        expect(manager.intervalObject).to.not.be.undefined
        expect(loggerStub.callCount).to.equal(2)
        expect(loggerStub.getCall(0).args[0]).to.equal(LOG_LEVEL.DEBUG)
        expect(loggerStub.getCall(0).args[1]).to.equal('Initializing datafile manager')
        expect(loggerStub.getCall(1).args[0]).to.equal(LOG_LEVEL.DEBUG)
        expect(loggerStub.getCall(1).args[1]).to.equal(`Starting datafile sync (interval: ${DEFAULT_DATAFILE_DOWNLOAD_INTERVAL})`)
        expect(downloadDatafileStub.callCount).to.equal(1)
        clock.tick(DEFAULT_DATAFILE_DOWNLOAD_INTERVAL - 1)
        expect(downloadDatafileStub.callCount).to.equal(1)
        clock.tick(1)
        expect(downloadDatafileStub.callCount).to.equal(2)
        clearInterval(manager.intervalObject)
      })

      it('should start datafile sync with custom interval', async () => {
        const manager = new OptimizelyDatafileManager({ logger })
        const downloadDatafileStub = sinon.stub(manager, 'downloadDatafile')
        await manager.initialize({
          projectId: PROJECT_ID,
          downloadInterval: CUSTOM_DATAFILE_DOWNLOAD_INTERVAL
        })
        expect(manager.projectId).to.equal(PROJECT_ID)
        expect(manager.datafileKey).to.equal(DATAFILE_KEY)
        expect(manager.datafileUrl).to.equal(DATAFILE_URL)
        expect(manager.intervalObject).to.not.be.undefined
        expect(loggerStub.callCount).to.equal(2)
        expect(loggerStub.getCall(0).args[0]).to.equal(LOG_LEVEL.DEBUG)
        expect(loggerStub.getCall(0).args[1]).to.equal('Initializing datafile manager')
        expect(loggerStub.getCall(1).args[0]).to.equal(LOG_LEVEL.DEBUG)
        expect(loggerStub.getCall(1).args[1]).to.equal(`Starting datafile sync (interval: ${CUSTOM_DATAFILE_DOWNLOAD_INTERVAL})`)
        expect(downloadDatafileStub.callCount).to.equal(1)
        clock.tick(CUSTOM_DATAFILE_DOWNLOAD_INTERVAL - 1)
        expect(downloadDatafileStub.callCount).to.equal(1)
        clock.tick(1)
        expect(downloadDatafileStub.callCount).to.equal(2)
        clearInterval(manager.intervalObject)
      })

      it('should not start datafile sync', async () => {
        const manager = new OptimizelyDatafileManager({ logger })
        const downloadDatafileStub = sinon.stub(manager, 'downloadDatafile')
        await manager.initialize({
          projectId: PROJECT_ID,
          downloadInterval: false
        })
        expect(manager.intervalObject).to.be.undefined
        expect(loggerStub.callCount).to.equal(2)
        expect(loggerStub.getCall(0).args[0]).to.equal(LOG_LEVEL.DEBUG)
        expect(loggerStub.getCall(0).args[1]).to.equal('Initializing datafile manager')
        expect(loggerStub.getCall(1).args[0]).to.equal(LOG_LEVEL.DEBUG)
        expect(loggerStub.getCall(1).args[1]).to.equal('Not starting datafile sync')
        expect(downloadDatafileStub.callCount).to.equal(1)
      })
    })

    describe('downloadDatafile', () => {
      it('should log a warning if project ID is missing', async () => {
        const manager = new OptimizelyDatafileManager({ logger })
        await manager.downloadDatafile()
        expect(loggerStub.calledOnce).to.be.true
        expect(loggerStub.getCall(0).args[0]).to.equal(LOG_LEVEL.WARNING)
        expect(loggerStub.getCall(0).args[1]).to.equal('Unable to download datafile before initializing the datafile manager')
      })

      it('should download datafile if no ETag', async () => {
        networkClientGetStub.onFirstCall().returns({
          result: {
            body: DATAFILE,
            headers: {
              etag: ETAG1
            },
            status: HTTP_STATUS_CODES.OK
          }
        })
        const manager = new OptimizelyDatafileManager({ logger, networkClient })
        manager.datafileUrl = DATAFILE_URL
        await manager.downloadDatafile({
          onDatafileChange: onDatafileChangeCallback
        })
        expect(onDatafileChangeCallback.calledOnce).to.be.true
        expect(onDatafileChangeCallback.getCall(0).args[0]).to.deep.equal(DATAFILE)
        expect(loggerStub.callCount).to.equal(2)
        expect(loggerStub.getCall(0).args[0]).to.equal(LOG_LEVEL.DEBUG)
        expect(loggerStub.getCall(0).args[1]).to.equal(`Downloading datafile: ${DATAFILE_URL}`)
        expect(loggerStub.getCall(1).args[0]).to.equal(LOG_LEVEL.DEBUG)
        expect(loggerStub.getCall(1).args[1]).to.equal(`Downloaded new datafile (ETag: ${ETAG1})`)
      })

      it('should download new datafile if ETag does not match', async () => {
        networkClientGetStub.onFirstCall().returns({
          result: {
            body: DATAFILE,
            headers: {
              etag: ETAG2
            },
            status: HTTP_STATUS_CODES.OK
          }
        })
        const manager = new OptimizelyDatafileManager({ logger, networkClient })
        manager.currentETag = ETAG1
        manager.datafileUrl = DATAFILE_URL
        await manager.downloadDatafile({
          onDatafileChange: onDatafileChangeCallback
        })
        expect(onDatafileChangeCallback.calledOnce).to.be.true
        expect(onDatafileChangeCallback.getCall(0).args[0]).to.deep.equal(DATAFILE)
        expect(loggerStub.callCount).to.equal(2)
        expect(loggerStub.getCall(0).args[0]).to.equal(LOG_LEVEL.DEBUG)
        expect(loggerStub.getCall(0).args[1]).to.equal(`Downloading datafile: ${DATAFILE_URL} (ETag: ${ETAG1})`)
        expect(loggerStub.getCall(1).args[0]).to.equal(LOG_LEVEL.DEBUG)
        expect(loggerStub.getCall(1).args[1]).to.equal(`Downloaded new datafile (ETag: ${ETAG2})`)
      })

      it('should not download new datafile if ETag does match', async () => {
        networkClientGetStub.onFirstCall().returns({
          result: {
            body: DATAFILE,
            headers: {
              etag: ETAG1
            },
            status: HTTP_STATUS_CODES.NOT_MODIFIED
          }
        })
        const manager = new OptimizelyDatafileManager({ logger, networkClient })
        manager.currentETag = ETAG1
        manager.datafileUrl = DATAFILE_URL
        await manager.downloadDatafile({
          onDatafileChange: onDatafileChangeCallback
        })
        expect(onDatafileChangeCallback.called).to.be.false
        expect(loggerStub.callCount).to.equal(2)
        expect(loggerStub.getCall(0).args[0]).to.equal(LOG_LEVEL.DEBUG)
        expect(loggerStub.getCall(0).args[1]).to.equal(`Downloading datafile: ${DATAFILE_URL} (ETag: ${ETAG1})`)
        expect(loggerStub.getCall(1).args[0]).to.equal(LOG_LEVEL.DEBUG)
        expect(loggerStub.getCall(1).args[1]).to.equal('Datafile has not changed')
      })

      it('should log a message if there was an error', async () => {
        networkClientGetStub.onFirstCall().throws()
        const manager = new OptimizelyDatafileManager({ logger, networkClient })
        manager.datafileUrl = DATAFILE_URL
        await manager.downloadDatafile({
          onDatafileChange: onDatafileChangeCallback
        })
        expect(onDatafileChangeCallback.called).to.be.false
        expect(loggerStub.callCount).to.equal(2)
        expect(loggerStub.getCall(0).args[0]).to.equal(LOG_LEVEL.DEBUG)
        expect(loggerStub.getCall(0).args[1]).to.equal(`Downloading datafile: ${DATAFILE_URL}`)
        expect(loggerStub.getCall(1).args[0]).to.equal(LOG_LEVEL.WARNING)
        expect(loggerStub.getCall(1).args[1]).to.equal(`Unable to download datafile ${DATAFILE_URL}: Error`)
      })
    })

    describe('stop', () => {
      it('should stop interval', () => {
        const manager = new OptimizelyDatafileManager({ logger })
        manager.intervalObject = setInterval(() => {}, 1000)
        manager.datafileUrl = DATAFILE_URL
        manager.stop()
        expect(loggerStub.callCount).to.equal(1)
        expect(loggerStub.getCall(0).args[0]).to.equal(LOG_LEVEL.DEBUG)
        expect(loggerStub.getCall(0).args[1]).to.equal(`Stop checking for datafile updates: ${DATAFILE_URL}`)
        expect(manager.intervalObject).to.be.null
      })

      it('should log a message if interval is not set', () => {
        const manager = new OptimizelyDatafileManager({ logger })
        manager.stop()
        expect(loggerStub.called).to.be.false
        expect(manager.intervalObject).to.be.undefined
      })
    })
  })
})
