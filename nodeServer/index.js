const webServer = require("./src/services/webServer")

async function initServer() {
    try {
        await webServer.init();
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}
initServer();

async function stopServer(e) {
    let err = e
    console.log('Cerrando el servidor :( \n')
    if (err) {
        process.exit(1)
    }
    process.exit(0)
}

process.on('SIGTERM', () => {stopServer();})

process.on('uncaughtException', () => {
    console.error(err);
    stopServer(err);
})