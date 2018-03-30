import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'

const BASE_PLUGINS = [
  commonjs(),
  json()
]

export default [{
    input: 'lib/index.js',
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      babel({
        presets: [
          ['env', {
            modules: false,
            targets: {
              'browsers': ['last 2 versions', '> 1%']
            }
          }],
          'stage-3'
        ],
        plugins: [
          'external-helpers'
        ],
        exclude: 'node_modules/**'
      }),
      ...BASE_PLUGINS
    ],
    output: {
      file: 'dist/index.browser.cjs.js',
      format: 'cjs',
      name: 'OptimizelySDK'
    }
  },
  {
    input: 'lib/index.js',
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
            modules: false,
            targets: {
              // @TODO target a specific version of node to reduce polyfills
              // https://babeljs.io/docs/plugins/preset-env/
              node: '6.10'
            }
          }],
          'stage-3'
        ],
        plugins: [
          'external-helpers'
        ],
        exclude: 'node_modules/**'
      }),
      ...BASE_PLUGINS
    ],
    output: {
      file: 'dist/index.node.cjs.js',
      format: 'cjs',
      name: 'OptimizelySDK'
    }
  }
]
