module.exports = {
    webpack: function (config, options) {
        config.experiments = {
            asyncWebAssembly: true
        };
        return config;
    }
};