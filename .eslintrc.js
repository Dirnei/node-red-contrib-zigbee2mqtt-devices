module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true,
        "amd": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "warn",
            4,
            {
                "SwitchCase":1
            }
            
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "warn",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-unused-vars" : [
            "off"
        ]
    }
};
