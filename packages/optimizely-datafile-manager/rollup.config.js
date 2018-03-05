import babel from "rollup-plugin-babel"
import commonjs from "rollup-plugin-commonjs"
import resolve from "rollup-plugin-node-resolve"
import json from "rollup-plugin-json"

const BASE_PLUGINS = [
]

const config = [
  {
    input: "lib/index.js",
    name: "OptimizelySDK",
    plugins: [
      ...BASE_PLUGINS,
      resolve({
        browser: true
      }),
      babel({
        presets: [
          ["es2015", { modules: false }],
          "stage-3"
        ],
        "plugins": [
          "external-helpers"
        ],
        exclude: "node_modules/**",
      }),
      commonjs(),
      json()
    ],
    output: {
      file: 'dist/index.browser.cjs.js',
      format: 'cjs'
    }
  },
  {
    input: "lib/index.js",
    name: "OptimizelySDK",
    plugins: [
      ...BASE_PLUGINS,
      resolve({
        main: true
      }),
      babel({
        presets: [
          ["es2015", { modules: false }],
          "stage-3"
        ],
        "plugins": [
          "external-helpers"
        ],
        exclude: "node_modules/**",
      }),
      commonjs(),
      json()
    ],
    output: {
      file: 'dist/index.node.cjs.js',
      format: 'cjs'
    }
  }
]

export default config
