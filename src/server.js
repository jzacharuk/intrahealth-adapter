const dotenv = require('dotenv');

const app = require('./app');

dotenv.config();

const port = process.env.PORT;

if (!port) {
    console.error('process.env.PORT not specified');
    return process.exit(1);
}

app.listen(process.env.PORT, (err) => {
    if (err) {
        console.error(`Unable to listen on port ${process.env.PORT}`);
        return process.exit(1);
    }
   console.log(`Listening on port ${process.env.PORT}`); 
})