/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@tensorflow/tfjs$': '@tensorflow/tfjs/dist/tf.fesm2015.js',
    }
    return config
  },
}
module.exports = nextConfig
