import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'

const BASE_PLUGINS = [
  commonjs(),
  json()
]

export default [{
    input: 'lib/index.js',
    output: {
      file: 'dist/index.browser.cjs.js',
      format: 'cjs',
      name: 'OptimizelySDK'
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      babel({
        presets: [
          ['env', {
            modules: false
          }],
          'stage-3'
        ],
        plugins: [
          'external-helpers'
        ],
        exclude: 'node_modules/**'
      }),
      ...BASE_PLUGINS
    ]
  },
  {
    input: 'lib/index.js',
    output: {
      file: 'dist/index.node.cjs.js',
      format: 'cjs',
      name: 'OptimizelySDK'
    },
    external: [
      'buffer',
      'http',
      'https',
      'stream',
      'url',
      'util',
      'zlib'
    ],
    plugins: [
      resolve({
        main: true,
        preferBuiltins: false
      }),
      babel({
        presets: [
          ['env', {
            modules: false
          }],
          'stage-3'
        ],
        plugins: [
          'external-helpers'
        ],
        exclude: 'node_modules/**'
      }),
      ...BASE_PLUGINS
    ]
  }
]
