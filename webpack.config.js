const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './src/lambda.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@opensearch-project/opensearch': path.resolve(__dirname, 'node_modules/@opensearch-project/opensearch'),
    },
  },
  output: {
    filename: 'lambda.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
};