const path = require('path');
const {
  DefinePlugin,
  NormalModuleReplacementPlugin
} = require('webpack');

const basePath = '.';

// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox', 'IE', 'PhantomJS' ]
const browsers = (process.env.TEST_BROWSERS || 'ChromeHeadless').split(',');

const singleStart = process.env.SINGLE_START;

const coverage = process.env.COVERAGE;

const esbuild = !!process.env.ESBUILD;

const absoluteBasePath = path.resolve(path.join(__dirname, basePath));

// use puppeteer provided Chrome for testing
process.env.CHROME_BIN = require('puppeteer').executablePath();

const suite = coverage ? 'test/coverageBundle.js' : 'test/spec/**/*.spec.js';

module.exports = function(karma) {

  const config = {

    basePath,

    frameworks: [
      'mocha',
      'sinon-chai'
    ],

    files: [
      suite
    ],

    preprocessors: {
      [ suite ]: [ 'env' ]
    },

    reporters: [ 'progress' ].concat(coverage ? 'coverage' : []),

    coverageReporter: coverage && {
      reporters: [
        { type: 'lcov', subdir: '.' },
      ]
    },

    browsers,

    singleRun: true,
    autoWatch: false,
  };

  if (esbuild) {
    setupEsbuild(config);
  } else {
    setupWebpack(config);
  }

  if (singleStart) {
    config.browsers = [].concat(config.browsers, 'Debug');
    config.envPreprocessor = [].concat(config.envPreprocessor || [], 'SINGLE_START');
  }

  karma.set(config);
};

function setupWebpack(config) {
  const webpackConfig = {
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.(css|bpmn)$/,
          use: 'raw-loader'
        },
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              plugins: [
                [ '@babel/plugin-transform-react-jsx', {
                  'importSource': 'preact',
                  'runtime': 'automatic'
                } ]
              ]
            }
          }
        },
        {
          test: /\.svg$/,
          use: [ 'react-svg-loader' ]
        }
      ].concat(coverage ?
        {
          test: /\.js$/,
          use: {
            loader: 'istanbul-instrumenter-loader',
            options: { esModules: true }
          },
          enforce: 'post',
          include: /src\.*/,
          exclude: /node_modules/
        } : []
      )
    },
    plugins: [
      new DefinePlugin({

        // @barmac: process.env has to be defined to make @testing-library/preact work
        'process.env': {}
      }),
      new NormalModuleReplacementPlugin(
        /^preact(\/[^/]+)?$/,
        function(resource) {

          const replMap = {
            'preact/hooks': path.resolve('node_modules/preact/hooks/dist/hooks.module.js'),
            'preact/jsx-runtime': path.resolve('node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js'),
            'preact': path.resolve('node_modules/preact/dist/preact.module.js')
          };

          const replacement = replMap[resource.request];

          if (!replacement) {
            return;
          }

          resource.request = replacement;
        }
      ),
      new NormalModuleReplacementPlugin(
        /^preact\/hooks/,
        path.resolve('node_modules/preact/hooks/dist/hooks.module.js')
      )
    ],
    resolve: {
      mainFields: [
        'browser',
        'module',
        'main'
      ],
      alias: {
        'react': 'preact/compat',
        'react-dom': 'preact/compat'
      },
      modules: [
        'node_modules',
        absoluteBasePath
      ]
    },
    devtool: 'eval-source-map'
  };

  config.frameworks.push('webpack');
  config.webpack = webpackConfig;
  config.preprocessors[ suite ].push('webpack');

}

function setupEsbuild(config) {

  const esbuildConfig = {
    define: {

      // @barmac: process.env has to be defined to make @testing-library/preact work
      'process.env': '{}'
    },

    jsxFactory: 'React.h',
    jsxFragment: 'React.Fragment',

    plugins: [
      require('esbuild-plugin-svgr')(),
      require('esbuild-plugin-alias')({
        'react': 'preact/compat',
        'react-dom': 'preact/compat'
      })
    ],

    loader: {
      '.css': 'text',
      '.bpmn': 'text'
    },

    singleBundle: true
  };

  config.preprocessors[ suite ].push('esbuild');
  config.esbuild = esbuildConfig;
}
