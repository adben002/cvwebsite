const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');

module.exports = function(env) {

  const baseLoc = "" + env.buildId;

  return {
    output: {
        filename: baseLoc + '/' + 'main.js'
    },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      minify: true,
      template: "./src/index.ejs",

    excludeChunks: [ 'main.js' ],
    excludeAssets: [/.*.js/],// exclude style.js or style.[chunkhash].js ,
      filename: 'index' + "-" + baseLoc + ".html",
      templateParameters: {
        'baseUrl': baseLoc
},
    }),
    new HtmlWebpackInlineSourcePlugin(),
    new HtmlWebpackExcludeAssetsPlugin(),
    new CopyWebpackPlugin([
        {
          from: '*',
          to: baseLoc,
          toType: 'dir',
          context: './src/resources/'
        },
        {
          from: 'error.html',
          to: 'error' + "-" + baseLoc + ".html",
          context: './src/'
        }
      ])
  ]
}
};