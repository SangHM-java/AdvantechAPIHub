module.exports = {
    "port": 3600,
    "appEndpoint": "http://localhost:3600",
    "apiEndpoint": "http://localhost:3600",
    "jwt_secret": "phenikaa!!@#jwt_secret",
    "jwt_expiration_in_seconds": 3600,
    "environment": "dev",
    "permissionLevels": {
        "NORMAL_USER": 1,
        "PAID_USER": 4,
        "ADMIN": 2048
    },
    "recaptcha_private_key": "6LcKT_QZAAAAAIqtoi9bey6olNU4kAmIOg2Qxfcp",
    "upload_path": "./uploads/"
};
