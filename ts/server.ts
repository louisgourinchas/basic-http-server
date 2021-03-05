import express  from "express";
import multer from 'multer';
import commandLineArgs, { OptionDefinition } from 'command-line-args';
import { check, validationResult, param } from 'express-validator';
import path from "path";
import fetch from 'node-fetch'

const upload = multer({ dest: '../uploads/' }); // Pour les données form-data et multipart form data

const app = express();
const DIR = process.cwd();
const PUB = path.join(DIR, '/public');
console.log( DIR );
console.log( PUB );

app.use('/static', express.static( PUB ) );
app.use( express.urlencoded({ extended: true }) );

// Process CLI
const optionDefinitions: OptionDefinition[] = [
    { name: 'port', alias: 'p', type: Number },
];
const options = commandLineArgs(optionDefinitions)

// Define HTTP API
app.get('/api/addition', upload.none(), [check('a').isNumeric(), check('b').isNumeric()], (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        const a = +req.body.a;
        const b = +req.body.b;
        res.status(200).send( `${a + b}\n` );
    } else {
        res.status(422).json({ errors: errors.array()});
    }
});

app.get('/proxy', [check('url').isString()], async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()){
        const URL = req.body.url
        console.log("\non veut " + URL + "\n\n");

        //res.json({code:'#WIP'});
        try {
            const R = await fetch(URL);
            res.status(R.status).send(await R.text() );
        } catch (err) {
            res.status(500).json({errors: err});
        }

    } else {
        res.status(444).json({ errors: errors.array()});
    }
});

app.get('/tmdb/search', [check('query').isString()], async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()){

        const query = req.body.query;

        try {
            const key = "9e0b7e444f3a564140d56af2346a8815";
            const adress = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${encodeURIComponent(query)}`;
            const R = await fetch(adress);
            res.status(R.status).json(await R.json() );
        } catch (err) {
            res.status(500).json({errors: err});
        }

    } else {
        res.status(444).json({ errors: errors.array()});
    }
});

app.post('/api/upload', upload.none() );

app.get('/', (req, res) => {
    res.send('Hello World!\n');
});


// Start HTTP serveur
const port = options.port ?? 3000;
app.listen(port, () => {
    console.log(`HTTP server listening at http://localhost:${port}`);
});
