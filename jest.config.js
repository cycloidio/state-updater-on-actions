
module.exports = {
  rootDir: __dirname,
  moduleFileExtensions: ['js'],
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest'
  },
  testPathIgnorePatterns: [
    '<rootDir>/dist'
  ],
  coverageDirectory: '<rootDir>/.coverage'
}
