module.exports = {
    webpack: function (config, options) {
        config.experiments = {
            asyncWebAssembly: true,
            syncWebAssembly: true
        };
        return config;
    }
};