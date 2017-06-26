module.exports = {
  plugins: [
    require('postcss-smart-import')({ /* ...options */ }),
    require('precss')({ /* ...options */ }),
    require('autoprefixer')({ browsers: ['last 2 versions', 'chrome 30', 'opera 15', 'safari 4'] })
  ]
}