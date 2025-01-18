const Setting = require('../models/Setting');
const { encrypt, decrypt } = require('../utils/encryption');
const { validateSetting } = require('../validators/settingValidator');
const { sequelize } = require('../config/database');

class SettingController {
  // Get all settings by category
  async getSettings(req, res) {
    try {
      const { category } = req.query;
      const where = category ? { category } : {};
      
      const settings = await Setting.findAll({ where });
      
      // Decrypt sensitive values
      const decryptedSettings = settings.map(setting => {
        const plainSetting = setting.get({ plain: true });
        if (plainSetting.isEncrypted && plainSetting.value) {
          plainSetting.value = decrypt(plainSetting.value);
        }
        return plainSetting;
      });

      res.json(decryptedSettings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update settings
  async updateSettings(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { settings } = req.body;
      const userId = req.user.id;

      const results = [];
      for (const setting of settings) {
        const validation = await validateSetting(setting);
        if (!validation.isValid) {
          throw new Error(`Validation failed for ${setting.key}: ${validation.error}`);
        }

        let value = setting.value;
        if (setting.isEncrypted && value) {
          value = encrypt(value);
        }

        const [updatedSetting] = await Setting.upsert({
          ...setting,
          value,
          updatedBy: userId
        }, { transaction });

        results.push(updatedSetting);
      }

      await transaction.commit();
      res.json(results);
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ error: error.message });
    }
  }

  // Apply settings
  async applySettings(req, res) {
    try {
      const { category } = req.body;
      const settings = await Setting.findAll({
        where: { category }
      });

      // Apply settings based on category
      switch (category) {
        case 'email':
          await this.applyEmailSettings(settings);
          break;
        case 'database':
          await this.applyDatabaseSettings(settings);
          break;
        case 'security':
          await this.applySecuritySettings(settings);
          break;
        case 'system':
          await this.applySystemSettings(settings);
          break;
        default:
          throw new Error('Invalid settings category');
      }

      res.json({ message: 'Settings applied successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Test settings
  async testSettings(req, res) {
    try {
      const { category } = req.body;
      const settings = await Setting.findAll({
        where: { category }
      });

      let testResult;
      switch (category) {
        case 'email':
          testResult = await this.testEmailSettings(settings);
          break;
        case 'database':
          testResult = await this.testDatabaseSettings(settings);
          break;
        default:
          throw new Error('Testing not available for this category');
      }

      res.json(testResult);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Private methods for applying settings
  async applyEmailSettings(settings) {
    // Implementation for applying email settings
  }

  async applyDatabaseSettings(settings) {
    // Implementation for applying database settings
  }

  async applySecuritySettings(settings) {
    // Implementation for applying security settings
  }

  async applySystemSettings(settings) {
    // Implementation for applying system settings
  }

  // Private methods for testing settings
  async testEmailSettings(settings) {
    // Implementation for testing email settings
  }

  async testDatabaseSettings(settings) {
    // Implementation for testing database settings
  }
}

module.exports = new SettingController();
