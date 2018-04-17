module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2017
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    'standard',
    'plugin:unicorn/recommended'
  ],
  plugins: [
    'unicorn'
  ],
  // add your custom rules here
  'rules': {
    // don't allow parenthesis less arrow functions
    'arrow-parens': 'error',
    'generator-star-spacing': 'error',
    // Enforce camelCase names everywhere
    'camelcase': ['error', { properties: 'always' }],
    //Enforce consistent self = this
    'consistent-this': ['error', 'self'],
    // Suggest to use const when the vars aren't reassigned
    'prefer-const':  ['error', { destructuring: 'all', ignoreReadBeforeAssign: false }],
    'no-console': 'error'
  }
}
