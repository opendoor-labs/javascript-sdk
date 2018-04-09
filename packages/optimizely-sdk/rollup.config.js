import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'

export default [{
    input: 'lib/index.browser.js',
    output: {
      file: 'dist/index.browser.umd.js',
      format: 'umd',
      name: 'OptimizelySDK.OptimizelySDK'
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      json(),
      commonjs({
        namedExports: {
          '@optimizely/optimizely-sdk-core': [ 'createInstance' ]
        }
      }),
      babel({
        presets: [
          ['env', {
            modules: false,
            targets: {
              browsers: ['last 2 versions', '>0.1%']
            }
          }],
          'stage-3'
        ],
        plugins: [
          'external-helpers'
        ],
        exclude: 'node_modules/**'
      })
    ]
  }
]
