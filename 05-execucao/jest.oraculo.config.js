module.exports = {
  rootDir: '..',

  testEnvironment: 'node',

  modulePaths: [
    '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/node_modules'
  ],

  moduleNameMapper: {
    '^\\.\\./\\.\\./hidroWebnia_API-main/src/(.*)$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/$1'
  },

  testPathIgnorePatterns: [
    '/node_modules/'
  ]
}
