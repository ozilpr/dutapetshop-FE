const serve = require('serve');
const path = require('path');

const directory = path.join(__dirname, 'build');
const server = serve(directory, {
    port: 3000,
    ignore: ['.gitignore', '.DS_Store'],
});

server.start();
