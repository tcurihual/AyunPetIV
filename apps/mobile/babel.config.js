module.exports = function (api) {
    api.cache(true)
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            [
                "module-resolver",
                {
                    root: ["./"],
                    alias: {
                        "@ui": "./components/ui",
                        "@common": "./components/common",
                        "@images": "./assets/images",
                        "@animations": "./assets/animations",
                        "@fonts": "./assets/fonts",
                    },
                },
            ],
        ],
    }
}
