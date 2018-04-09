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

import { LOG_LEVEL, HTTP_STATUS_CODES } from '@optimizely/optimizely-sdk-core/lib/utils/enums'
import OptimizelyDatafileManager from '../datafile_manager.browser'
import { createLogger } from '@optimizely/optimizely-sdk-core/lib/plugins/logger'
import OptimizelyNetworkClient from '@optimizely/optimizely-network-client'

const logger = createLogger({ logLevel: LOG_LEVEL.DEBUG })
const loggerStub = sinon.stub(logger, 'log')
const networkClient = new OptimizelyNetworkClient({ logger })
const networkClientGetStub = sinon.stub(networkClient, 'get')
const onDatafileChangeCallback = sinon.spy()

const DATAFILE = {
  a: 1,
  b: 2
}
const ETAG1 = '0123456789'
const PROJECT_ID = 123
const DATAFILE_URL = `https://cdn.optimizely.com/json/${PROJECT_ID}.json`

describe('optimizely-datafile-manager.browser', () => {
  describe('datafile_manager', () => {
    afterEach(() => {
      loggerStub.reset()
      networkClientGetStub.reset()
      onDatafileChangeCallback.resetHistory()
    })

    describe('constructor', () => {
      // @TODO: implement tests
      xit('...', () => {})
    })

    describe('initialize', () => {
      it('should log a warning if project ID is missing', async () => {
        const manager = new OptimizelyDatafileManager({ logger })
        await manager.initialize({})
        expect(loggerStub.calledOnce).to.be.true
        expect(loggerStub.getCall(0).args[0]).to.equal(LOG_LEVEL.WARNING)
        expect(loggerStub.getCall(0).args[1]).to.equal('Unable to initialize datafile manager without project ID')
      })

      it('should not start datafile sync', async () => {
        const manager = new OptimizelyDatafileManager({ logger })
        const downloadDatafileStub = sinon.stub(manager, 'downloadDatafile')
        await manager.initialize({
          projectId: PROJECT_ID
        })
        expect(manager.intervalObject).to.be.undefined
        expect(loggerStub.callCount).to.equal(1)
        expect(loggerStub.getCall(0).args[0]).to.equal(LOG_LEVEL.DEBUG)
        expect(loggerStub.getCall(0).args[1]).to.equal('Initializing Optimizely Datafile Manager')
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

      it('should download datafile', async () => {
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
      it('should do nothing', () => {
        const manager = new OptimizelyDatafileManager({ logger })
        manager.stop()
        expect(loggerStub.called).to.be.false
        expect(manager.intervalObject).to.be.undefined
      })
    })
  })
})
