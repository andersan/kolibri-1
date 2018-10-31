const path = require('path');
const fs = require('fs');
const { lint } = require('kolibri-tools/lib/lint');

const supportedLanguages = require('../../kolibri/locale/supported_languages.json');

const commonHeader = `
/*
 * This is an auto-generated file, any manual edits will be overridden.
 *
 * To regenerate, see instructions here:
 *   https://kolibri-dev.readthedocs.io/en/develop/references/i18n.html
 *
 * This file was generated by frontend_build/src/intl_code_gen.js
 */
`;
const vueIntlHeader = `module.exports = function () {
  const data = [];`;

const generateVueIntlItems = language => {
  /*
   * Generate entries of this form:
   *   data.push(require('vue-intl/locale-data/ar.js'));
   *
   * Some Intl codes look like 'ar' and others look like 'bn-bd', so for Vue Intl
   * we strip off the territory code if it's there.
   */
  const vue_intl_code = language.intl_code.split('-')[0];
  return `data.push(require('vue-intl/locale-data/${vue_intl_code}.js'));`;
};

const vueIntlFooter = `
  return data;
};
`;

const vueIntlModule = commonHeader +
  vueIntlHeader +
  supportedLanguages.map(generateVueIntlItems).join('') +
  vueIntlFooter;

const vueIntlModulePath = path.resolve(
  __dirname,
  '../../kolibri/core/assets/src/utils/vue-intl-locale-data.js'
);

const intlHeader = `module.exports = function(locale) {
  switch (locale) {`;

const generateIntlItems = language => {
  /*
   * Generate entries of the form:
   *
   * case 'sw-tz':
   *   return new Promise(function(resolve) {
   *     require.ensure(
   *       ['intl/locale-data/jsonp/sw-TZ.js'],
   *       function(require) {
   *         resolve(() => require('intl/locale-data/jsonp/sw-TZ.js'));
   *       }
   *     );
   *   });
   *
   * Note that not all codes have two parts, e.g. 'en' vs 'es-mx'.
   */

  const codes = language.intl_code.split('-');
  let file_name = codes[0];
  if (codes.length > 1) {
    file_name += '-' + codes[1].toUpperCase();
  }
  return `
    case '${language.intl_code}':
      return new Promise(function(resolve) {
        require.ensure(
          ['intl/locale-data/jsonp/${file_name}.js'],
          function(require) {
            resolve(() => require('intl/locale-data/jsonp/${file_name}.js'));
          }
        );
      });`;
};

const intlFooter = `
    default:
      return new Promise(function(resolve) {
        require.ensure(
          ['intl/locale-data/jsonp/en.js'],
          function(require) {
            resolve(() => require('intl/locale-data/jsonp/en.js'));
          }
        );
      });
  }
};
`;

const intlModule = commonHeader + intlHeader + supportedLanguages.map(generateIntlItems).join('') + intlFooter;

const intlModulePath = path.resolve(
  __dirname,
  '../../kolibri/core/assets/src/utils/intl-locale-data.js'
);

fs.writeFileSync(vueIntlModulePath, vueIntlModule, { encoding: 'utf-8' });

fs.writeFileSync(intlModulePath, intlModule, { encoding: 'utf-8' });

lint({
  file: intlModulePath,
  write: true,
});

lint({
  file: vueIntlModulePath,
  write: true,
});
