/**
 * @file app.config.js
 * @description Konfigurasi dinamis Expo untuk membaca Google Maps API Key dari environment
 * tanpa menyimpan key di dalam app.json.
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
