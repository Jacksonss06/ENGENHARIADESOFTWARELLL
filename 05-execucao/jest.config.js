module.exports = {
  rootDir: '..',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^\\./cycleUtils$|^\\.\\./src/utils/cycleUtils$': '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/utils/cycleUtils.js',
    '^\\./time$|^\\.\\./src/utils/time$': '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/utils/time.js',
    '^\\./timeRange$|^\\.\\./src/utils/timeRange$': '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/utils/timeRange.js',
    '^\\./timeManager$|^\\.\\./src/utils/timeManager$': '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/utils/timeManager.js',
    '^\\./adminMiddleware$|^\\.\\./src/middlewares/adminMiddleware$': '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/middlewares/adminMiddleware.js',
    '^\\./validationMiddleware$|^\\.\\./src/middlewares/validationMiddleware$': '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/middlewares/validationMiddleware.js',
    '^\\./authMiddleware$|^\\.\\./src/middlewares/authMiddleware$': '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/middlewares/authMiddleware.js',
    '^\\./graphicsService$|^\\.\\./src/services/graphicsService$': '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/services/graphicsService.js',
    '^\\./csvGenerator$|^\\.\\./src/services/csvGenerator$': '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/services/csvGenerator.js',
    '^\\./graphicsController$|^\\.\\./src/controllers/graphicsController$': '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/controllers/graphicsController.js',
    '^\\./authController$|^\\.\\./src/controllers/authController$': '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/controllers/authController.js',
    '^\\./devicesController$|^\\.\\./src/controllers/devicesController$': '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/controllers/devicesController.js',
    '^\\./exportController$|^\\.\\./src/controllers/exportController$': '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/controllers/exportController.js'
  },
  testPathIgnorePatterns: ['/node_modules/']
}
