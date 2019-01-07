module.exports = {
  extends: 'airbnb-base',
  //installedESLint: true,
  plugins: [
    'import',
  ],
  rules: {
    "prefer-destructuring": ["error", {
      "object": false,
      "array": false
    }]
  },
};
