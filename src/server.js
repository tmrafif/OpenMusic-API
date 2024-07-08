require("dotenv").config();

const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");

// albums
const albums = require("./api/albums");
const AlbumsServices = require("./services/postgres/AlbumsServices");
const AlbumsValidator = require("./validator/albums");

// songs
const songs = require("./api/songs");
const SongsServices = require("./services/postgres/SongsServices");
const SongsValidator = require("./validator/songs");

// users
const users = require("./api/users");
const UsersServices = require("./services/postgres/UsersServices");
const UsersValidator = require("./validator/users");

// authentications
const authentications = require("./api/authentications");
const AuthenticationsServices = require("./services/postgres/AuthenticationsServices");
const AuthenticationsValidator = require("./validator/authentications");
const TokenManager = require("./tokenize/TokenManager");

const ClientError = require("./exceptions/ClientError");

const init = async () => {
    // init services
    const albumsServices = new AlbumsServices();
    const songsServices = new SongsServices();
    const usersServices = new UsersServices();
    const authenticationsServices = new AuthenticationsServices();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ["*"],
            },
        },
    });

    // register external plugin
    await server.register([{ plugin: Jwt }]);

    // define jwt authentication strategy
    server.auth.strategy("openmusicapp_jwt", "jwt", {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    // register plugin
    await server.register([
        {
            plugin: albums,
            options: {
                service: albumsServices,
                validator: AlbumsValidator,
            },
        },
        {
            plugin: songs,
            options: {
                service: songsServices,
                validator: SongsValidator,
            },
        },
        {
            plugin: users,
            options: {
                service: usersServices,
                validator: UsersValidator,
            },
        },
        {
            plugin: authentications,
            options: {
                authenticationsServices,
                usersServices,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            },
        },
    ]);

    // extension function
    server.ext("onPreResponse", (request, h) => {
        const { response } = request;

        if (response instanceof ClientError) {
            const newResponse = h.response({
                status: "fail",
                message: response.message,
            });
            newResponse.code(response.statusCode);
            return newResponse;
        }

        if (response instanceof Error) {
            const newResponse = h.response({
                status: "error",
                message: response.output.payload.message,
            });
            newResponse.code(response.output.statusCode);
            console.error(response);
            return newResponse;
        }

        return h.continue;
    });

    // start server
    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

init();
