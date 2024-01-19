import express from 'express';
import connect from './schemas/index.js';
import prodcutsRouter from './routes/products.router.js';

const app = express();
const PORT = 3000;

connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api', prodcutsRouter);

app.listen(PORT, () => {
    console.log(PORT, '포트로 서버가 열렸어요!');
});
