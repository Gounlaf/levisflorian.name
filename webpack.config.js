import CopyPlugin from 'copy-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import {CleanWebpackPlugin} from 'clean-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import path from 'node:path'

const devMode = process.env.NODE_ENV !== 'production'
const buildPath = path.resolve(import.meta.dirname, 'dist')

const isProduction = process.argv[process.argv.indexOf('--mode') + 1] === 'production';

export default {
  devServer: {
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: true,
      },
    },
  },
  // This option controls if and how source maps are generated.
  // https://webpack.js.org/configuration/devtool/
  devtool: devMode ? 'eval-source-map' : false,
  // https://webpack.js.org/concepts/entry-points/#multi-page-application
  entry: {
    index: `${import.meta.dirname}/src/index.mjs`,
    'pdf.worker': 'pdfjs-dist/build/pdf.worker.mjs',
  },
  // how to write the compiled files to disk
  // https://webpack.js.org/concepts/output/
  output: {
    filename: '[name].[fullhash:20].js',
    path: buildPath
  },
  // https://webpack.js.org/concepts/loaders/
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ],
      }
    ],
  },
  plugins: [
    new CleanWebpackPlugin({}),
    new CopyPlugin({
      patterns: [
        {from: 'static', to: 'static'},
      ],
    }),
    new HtmlWebpackPlugin({
      title: 'Florian Levis - Curriculum Vitae',
      template: './src/index.html',
      inject: true,
      chunks: ['index'],
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name].[contenthash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[contenthash].css',
    }),
  ],
  // https://webpack.js.org/configuration/optimization/
  optimization: {
    minimize: isProduction,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin()
    ]
  }
};
