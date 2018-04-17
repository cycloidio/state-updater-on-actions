const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/state-updater.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'stateUpdaterOnActions',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    // Workaround for the issue https://github.com/webpack/webpack/issues/6522
    globalObject: 'typeof self !== "undefined" ? self : this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|dist)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: ['transform-runtime']
          }
        }
      }
    ]
  }
}
