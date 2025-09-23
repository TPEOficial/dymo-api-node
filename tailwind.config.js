const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    content: [],
    theme: {
        extend: {
            fontFamily: {
                sans: [...defaultTheme.fontFamily.sans]
            }
        }
    },
    corePlugins: {
        preflight: false
    }
};