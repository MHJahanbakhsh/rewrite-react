const path = require('path');

module.exports = {
  entry: './test.jsx', // Entry point for your JSX file
  output: {
    filename: 'bundle.js', // Output bundled JavaScript
    path: path.resolve(__dirname, 'dist'), // Output folder
  },
  module: {
    rules: [
      {
        test: /\.jsx$/, // Apply Babel to all .jsx files
        exclude: /node_modules/, // Exclude node_modules folder
        use: {
          loader: 'babel-loader', // Use babel-loader
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Presets for modern JS and JSX
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Resolve .js and .jsx extensions
  },
  mode: 'development', // Set mode to 'development' for easier debugging
  devtool: 'source-map', // Enable source maps for easier debugging
};
