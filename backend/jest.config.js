module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The root directory that Jest should scan for tests and modules
  rootDir: '.',

  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/tests'],

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**/*.js',
    '**/tests/**/*.test.js'
  ],

  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  // An array of regexp pattern strings that are matched against all source paths
  transformIgnorePatterns: [
    '/node_modules/',
    '\\.pnp\\.[^\\/]+$'
  ],

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/dist/'
  ],

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    'json',
    'text',
    'lcov',
    'clover'
  ],

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // A path to a module which exports an async function that is triggered once before all test suites
  globalSetup: '<rootDir>/tests/setup.js',

  // A set of global variables that need to be available in all test environments
  globals: {
    'NODE_ENV': 'test'
  },

  // The maximum amount of workers used to run your tests
  maxWorkers: '50%',

  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: [
    'node_modules',
    '<rootDir>/src'
  ],

  // A map from regular expressions to module names that allow to stub out resources
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // Activates notifications for test results
  notify: false,

  // An enum that specifies notification mode
  notifyMode: 'failure-change',

  // Run tests with specified reporters
  reporters: ['default'],

  // Automatically restore mock state between every test
  restoreMocks: true,

  // The paths to modules that run some code to configure or set up the testing environment
  setupFiles: [],

  // A list of paths to modules that run some code to configure or set up the testing framework
  setupFilesAfterEnv: [],

  // The number of seconds after which a test is considered as slow
  slowTestThreshold: 5,

  // A list of paths to snapshot serializer modules Jest should use
  snapshotSerializers: [],

  // Options that will be passed to the testEnvironment
  testEnvironmentOptions: {},

  // The regexp pattern or array of patterns that Jest uses to detect test files
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',

  // This option sets the URL for the jsdom environment
  testURL: 'http://localhost',

  // Setting this value to "fake" allows the use of fake timers for functions such as "setTimeout"
  timers: 'real',

  // A map from regular expressions to paths to transformers
  transform: {},

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // An array of regexp patterns that are matched against all source file paths before re-running tests
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ]
};
