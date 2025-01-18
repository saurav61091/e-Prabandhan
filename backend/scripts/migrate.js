const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const config = require('../config/config');
const path = require('path');

// Get environment from command line or default to development
const env = process.argv[2] || 'development';
const dbConfig = config[env];

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: console.log
  }
);

// Create Umzug instance for migrations
const umzug = new Umzug({
  migrations: {
    path: path.join(__dirname, '../migrations'),
    params: [sequelize.getQueryInterface(), Sequelize],
    pattern: /\.js$/
  },
  storage: new SequelizeStorage({ sequelize }),
  logger: console
});

// Migration commands
const commands = {
  up: async () => {
    try {
      await umzug.up();
      console.log('All migrations performed successfully');
    } catch (error) {
      console.error('Error performing migrations:', error);
      process.exit(1);
    }
  },
  down: async () => {
    try {
      await umzug.down();
      console.log('Last migration reverted successfully');
    } catch (error) {
      console.error('Error reverting migration:', error);
      process.exit(1);
    }
  },
  refresh: async () => {
    try {
      await umzug.down({ to: 0 });
      await umzug.up();
      console.log('Database refreshed successfully');
    } catch (error) {
      console.error('Error refreshing database:', error);
      process.exit(1);
    }
  },
  status: async () => {
    try {
      const pending = await umzug.pending();
      const executed = await umzug.executed();
      
      console.log('Current migration status:');
      console.log('Executed migrations:', executed.map(m => m.name));
      console.log('Pending migrations:', pending.map(m => m.name));
    } catch (error) {
      console.error('Error getting migration status:', error);
      process.exit(1);
    }
  }
};

// Get command from command line
const cmd = process.argv[3] || 'up';

// Run command
if (commands[cmd]) {
  commands[cmd]()
    .then(() => {
      console.log('Migration command completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration command failed:', error);
      process.exit(1);
    });
} else {
  console.error('Invalid command. Use: up, down, refresh, or status');
  process.exit(1);
}
