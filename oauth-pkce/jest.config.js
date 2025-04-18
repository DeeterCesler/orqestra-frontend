module.exports = {
    testEnvironment: 'jsdom',
    moduleFileExtensions: [
      'js',
      'json',
      'vue'
    ],
    transform: {
      '^.+\\.vue$': '@vue/vue3-jest',
      '^.+\\.[t|j]sx?$': 'babel-jest'
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '^.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub'
    },
    testEnvironmentOptions: {
      customExportConditions: ['node', 'node-addons']
    },
    collectCoverageFrom: [
      'src/**/*.{js,vue}',
      '!src/main.js',
      '!src/router/index.js',
      '!**/node_modules/**'
    ],
    coverageReporters: ['text', 'lcov', 'json-summary'],
    testMatch: [
      '**/__tests__/**/*.[jt]s?(x)',
      '**/?(*.)+(spec|test).[jt]s?(x)'
    ],
    setupFiles: ['<rootDir>/jest.setup.js']
}
