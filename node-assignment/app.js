import express from 'express';
import connect from './schemas/index.js';
import prodcutsRouter from './routes/products.router.js';
import { swaggerUi, specs } from './routes/swagger.js';

const app = express();
const PORT = 3000;

connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => {
    res.json('Hello World!!!!');
});

app.use('/api', prodcutsRouter);

app.listen(PORT, () => {
    console.log(PORT, '포트로 서버가 열렸어요!');
});
