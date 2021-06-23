import path from 'path'
import webpack from 'webpack'
import CopyWebpackPlugin from 'copy-webpack-plugin'

const isProduction = process.env.NODE_ENV === 'production'

export default {
  mode: isProduction ? 'production' : 'development',
  context: __dirname,
  devtool: isProduction ? 'source-map' : false,
  node: {__dirname: true},
  entry: {
    content: ['./src/content'],
    background: ['./src/background'],
    api: ['./src/api'],
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js',
    publicPath: '/assets/',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      util: require.resolve('util/'),
      url: require.resolve('./src/url.js'),
      fs: require.resolve('./src/fs.js'),
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      perf_hooks: require.resolve('universal-perf-hooks/dist/browser.js'),
      zlib: require.resolve('browserify-zlib'),
      module: false,
      child_process: false,
      '@applitools/screenshoter': false,
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/manifest.json', to: './' },
        { from: './assets', to: './assets' },
        {
          from: path.resolve(path.dirname(require.resolve('@applitools/dom-snapshot')), './dist/*.js'),
          to: './assets/dom-snapshot/[name].[ext]',
          filter: (resourcePath) => /(processPagePoll|pollResult)\.js$/.test(resourcePath)
        },
        {
          from: path.resolve(path.dirname(require.resolve('@applitools/dom-capture')), './dist/*.js'),
          to: './assets/dom-capture/[name].[ext]',
          filter: (resourcePath) => /(captureDomAndPoll|pollResult)\.js$/.test(resourcePath)
        },
      ]
    }),
    new webpack.DefinePlugin({
      'process.env': {}
    }),
    new webpack.ProvidePlugin({
      Buffer: [require.resolve('buffer'), 'Buffer'],
      process: [require.resolve('process')],
      setImmediate: [require.resolve('core-js/features/set-immediate')]
    }),
  ],
}
