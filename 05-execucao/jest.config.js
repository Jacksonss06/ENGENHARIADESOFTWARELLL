module.exports = {
  rootDir: '..',

  testEnvironment: 'node',

  modulePaths: [
    '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/node_modules'
  ],

  moduleNameMapper: {
    '^\\.\\./model/Devices$|^\\.\\./src/model/Devices$|^\\.\\./\\.\\./src/model/Devices$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/model/Devices.js',

    '^\\.\\./model/User$|^\\.\\./src/model/User$|^\\.\\./\\.\\./src/model/User$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/model/User.js',

    '^\\.\\./config/nodemail$|^\\.\\./src/config/nodemail$|^\\.\\./\\.\\./src/config/nodemail$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/config/nodemail.js',

    '^\\.\\./config/cloudinary$|^\\.\\./src/config/cloudinary$|^\\.\\./\\.\\./src/config/cloudinary$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/config/cloudinary.js',

    '^\\./cycleUtils$|^\\.\\./utils/cycleUtils$|^\\.\\./src/utils/cycleUtils$|^\\.\\./\\.\\./src/utils/cycleUtils$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/utils/cycleUtils.js',

    '^\\./time$|^\\.\\./utils/time$|^\\.\\./src/utils/time$|^\\.\\./\\.\\./src/utils/time$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/utils/time.js',

    '^\\./timeRange$|^\\.\\./utils/timeRange$|^\\.\\./src/utils/timeRange$|^\\.\\./\\.\\./src/utils/timeRange$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/utils/timeRange.js',

    '^\\./timeManager$|^\\.\\./utils/timeManager$|^\\.\\./src/utils/timeManager$|^\\.\\./\\.\\./src/utils/timeManager$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/utils/timeManager.js',

    '^\\./adminMiddleware$|^\\.\\./middlewares/adminMiddleware$|^\\.\\./src/middlewares/adminMiddleware$|^\\.\\./\\.\\./src/middlewares/adminMiddleware$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/middlewares/adminMiddleware.js',

    '^\\./validationMiddleware$|^\\.\\./middlewares/validationMiddleware$|^\\.\\./src/middlewares/validationMiddleware$|^\\.\\./\\.\\./src/middlewares/validationMiddleware$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/middlewares/validationMiddleware.js',

    '^\\./authMiddleware$|^\\.\\./middlewares/authMiddleware$|^\\.\\./src/middlewares/authMiddleware$|^\\.\\./\\.\\./src/middlewares/authMiddleware$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/middlewares/authMiddleware.js',

    '^\\./graphicsService$|^\\.\\./services/graphicsService$|^\\.\\./src/services/graphicsService$|^\\.\\./\\.\\./src/services/graphicsService$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/services/graphicsService.js',

    '^\\./csvGenerator$|^\\.\\./services/csvGenerator$|^\\.\\./src/services/csvGenerator$|^\\.\\./\\.\\./src/services/csvGenerator$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/services/csvGenerator.js',

    '^\\.\\./services/pdfGenarator$|^\\.\\./src/services/pdfGenarator$|^\\.\\./\\.\\./src/services/pdfGenarator$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/services/pdfGenarator.js',

    '^\\./graphicsController$|^\\.\\./controllers/graphicsController$|^\\.\\./src/controllers/graphicsController$|^\\.\\./\\.\\./src/controllers/graphicsController$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/controllers/graphicsController.js',

    '^\\./authController$|^\\.\\./controllers/authController$|^\\.\\./src/controllers/authController$|^\\.\\./\\.\\./src/controllers/authController$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/controllers/authController.js',

    '^\\./devicesController$|^\\.\\./controllers/devicesController$|^\\.\\./src/controllers/devicesController$|^\\.\\./\\.\\./src/controllers/devicesController$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/controllers/devicesController.js',

    '^\\./exportController$|^\\.\\./controllers/exportController$|^\\.\\./src/controllers/exportController$|^\\.\\./\\.\\./src/controllers/exportController$':
      '<rootDir>/01-projeto-base/backend/hidroWebnia_API-main/src/controllers/exportController.js'
  },

  testPathIgnorePatterns: ['/node_modules/']
}