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
      process: false,
      fs: false,
      url: false,
      child_process: false,
      module: false,
    },
  },
  module: {
    rules: [
      {
        test: /@applitools\/screenshoter/,
        use: 'null-loader',
      },
      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          // "url" loader works just like "file" loader but it also embeds
          // assets smaller than specified size as data URLs to avoid requests.
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'media/[name].[hash:8].[ext]',
            },
          },
          // Process JS with Babel.
          {
            test: /\.js$/,
            include: [path.resolve(__dirname, 'src')],
            use: [
              {
                loader: 'babel-loader',
                options: {
                  compact: true,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  plugins: [
    //new webpack.NamedModulesPlugin(),
    // Copy non-umd assets to vendor
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: '../' },
        { from: 'icons', to: '../icons' },
      ]
    }),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
}
