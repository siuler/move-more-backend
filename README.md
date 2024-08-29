# Setup
- Open project in root directory
- run ``npm run setup``

The project needs a running MySQL server.
The mysql server credentials can be specified in [config.json](src/config/config.json)

# Build
The following files must be provided before building the project:
src/general/server/ssl/
    - fastify.key: Certificate private key file used for SSL encryption
    - jwt.pem: Encrypted private key file for encrypting JWT tokens
src/domain/messaging/push-notification/service/
    - firebaseServiceAccountKey.json: Firebase Service Account Key used for sending push notifications
src/config/
    - config.prod.json: Config file containing production settings