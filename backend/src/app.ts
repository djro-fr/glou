import express, { type Express, type Request, type Response } from 'express';
import {client} from '../config/database.ts'

const app: Express = express();
app.disable('x-powered-by');
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.get('/fountains', async(req: Request, res: Response) => {
  const result = await client.query(
    `SELECT *
     FROM fountain;`);
  res.send(result.rows);
});

app.get('/fountains/:id', async(req: Request, res: Response) => {
  const result = await client.query(
    `SELECT *
     FROM fountain
     WHERE id =$1;`,[req.params.id]);
  res.send(result.rows);
});

app.get('/districts', async(req: Request, res: Response) => {
  const result = await client.query(
    `SELECT *
     FROM district;`);
  res.send(result.rows);
});

app.use(express.json());

app.post('/contact', async(req: Request, res: Response) => {
  res.json(req.body);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});