require("dotenv").config();

const Hapi = require("@hapi/hapi");

const albums = require("./api/albums");
const AlbumsServices = require("./services/postgres/AlbumsServices");
const AlbumsValidator = require("./validator/albums");

const songs = require("./api/songs");
const SongsServices = require("./services/postgres/SongsServices");
const SongsValidator = require("./validator/songs");

const ClientError = require("./exceptions/ClientError");

const init = async () => {
    // init services
    const albumsServices = new AlbumsServices();
    const songsServices = new SongsServices();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ["*"],
            },
        },
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
                status: 'error',
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
