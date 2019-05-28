/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { AsyncStorage } from './storage'

// TODO: Add key prefix in here

// TODO: getItem and setItem can throw errors - must handle

// TODO: Implement size limit and LRU semantics? Should this be done for all storage adapters or at a higher level?

const asyncLocalStorage: AsyncStorage<string> = {
  async getItem(key: string): Promise<string | null> {
    return Promise.resolve(localStorage.getItem(key))
  },

  setItem(key: string, value: string): Promise<void> {
    return Promise.resolve(localStorage.setItem(key, value))
  },

  removeItem(key: string): Promise<void> {
    return Promise.resolve(localStorage.removeItem(key))
  },
}

export default asyncLocalStorage
