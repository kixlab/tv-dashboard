var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'main.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './dist'),
    publicPath: ''
  },
  externals: {
    "events": "EVENTS"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      },
      {
        test: /\.s?css$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1
              }
            },
            'postcss-loader',
            'sass-loader'
          ]})
      },
      {
        test: /\.json$/,
        use: 'json-loader'
      },
      {
        test: /\.(png|svg|jpg)$/,
        loader: "url-loader?limit=10000"
      },
    ]
  },
  plugins: [
    new ExtractTextPlugin("style.css"),
    new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /^\.\/(xx)$/)
  ]
}
