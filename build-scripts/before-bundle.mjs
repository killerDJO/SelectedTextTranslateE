import path from 'node:path';
import fs from 'node:fs';
import { extend } from 'lodash-es';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

modifySettings();

function modifySettings() {
  console.log('Applying production default settings...');

  const defaultSettingsPath = path.join(
    __dirname,
    '../target/release/resources/default_settings.json'
  );
  const productionSettingsPath = path.join(__dirname, 'resources/production-settings.json');

  console.log(`Using default settings from: ${defaultSettingsPath}`);

  const defaultSettings = JSON.parse(fs.readFileSync(defaultSettingsPath));
  const productionSettings = JSON.parse(fs.readFileSync(productionSettingsPath));
  const mergedSettings = extend(defaultSettings, productionSettings);
  fs.writeFileSync(defaultSettingsPath, JSON.stringify(mergedSettings, null, 2));

  console.log('Production settings applied');
}
