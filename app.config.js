/**
 * @file app.config.js
 * @description Konfigurasi dinamis Expo untuk membaca Google Maps API Key dan
 * google-services.json dari environment tanpa menyimpannya di dalam app.json.
 */

module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

  // SDK 58 membaca key lewat opsi plugin react-native-maps. Key tetap diambil dari env,
  // bukan ditulis di app.json.
  const plugins = (config.plugins ?? []).map((plugin) => {
    if (plugin === 'react-native-maps') {
      return [
        'react-native-maps',
        googleMapsApiKey ? { androidGoogleMapsApiKey: googleMapsApiKey } : {},
      ];
    }
    return plugin;
  });

  return {
    ...config,
    plugins,
    android: {
      ...config.android,
      // Di EAS, GOOGLE_SERVICES_JSON berisi path file sementara.
      // Di laptop variabel ini kosong, jadi memakai file lokal.
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
      config: {
        ...config.android?.config,
        googleMaps: {
          ...config.android?.config?.googleMaps,
          apiKey: googleMapsApiKey,
        },
      },
    },
  };
};