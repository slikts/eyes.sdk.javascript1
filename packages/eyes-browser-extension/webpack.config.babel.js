import path from 'path'
import webpack from 'webpack'
import CopyWebpackPlugin from 'copy-webpack-plugin'

const isProduction = process.env.NODE_ENV === 'production'

export default {
  context: path.resolve(__dirname, 'src'),
  devtool: isProduction ? 'source-map' : false,
  entry: {
    content: ['./content'],
    background: ['./background'],
  },
  output: {
    path: path.resolve(__dirname, 'build/assets'),
    filename: '[name].js',
    publicPath: '/assets/',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.js', '.json'],
    fallback: {
      assert: require.resolve('assert/'),
      buffer: require.resolve('buffer/'),
      child_process: false,
      crypto: require.resolve('crypto-browserify'),
      fs: false,
      module: false,
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      process: require.resolve('process'),
      stream: require.resolve('stream-browserify'),
      url: false,
      util: require.resolve('util/'),
      zlib: require.resolve('browserify-zlib'),
    },
  },
  module: {
    rules: [
      {
        test: /@applitools\/screenshoter/,
        use: 'null-loader',
      },
      {
        test: /yaml/,
        use: 'null-loader',
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: '../' },
        { from: 'icons', to: '../icons' },
      ]
    }),
    new webpack.DefinePlugin({
      'process.env': {}
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: ['process'],
    }),
  ],
}
