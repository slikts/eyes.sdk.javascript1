import path from 'path'

const isProduction = process.env.NODE_ENV === 'production'

export default {
  mode: isProduction ? 'production' : 'development',
  context: path.resolve(__dirname, 'src'),
  entry: {
    pageHandler: './page/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'build/assets'),
    //libraryTarget: 'var',
    filename: 'pageScripts.js',
  },
}
