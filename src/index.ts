import express from 'express'
import { pcInfoRouter } from './routes/pcInfo.route';

const app = express();
const port = 3000

app.use(express.json());

app.use('/api', pcInfoRouter);

app.listen(port, () => {
    console.log(`APP ESCUCHANDO EN PUERTO: ${port}`);
});