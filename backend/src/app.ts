import '../config/env.ts'

import express, { type Express } from 'express';

import { getAllFountainsController,getFountainByIdController } from './Controller/fountainController.ts';
import { getAllDistrictsController }from './Controller/districtController.ts'
import { sendContactEMailController } from './Controller/contactController.ts';

const app: Express = express();
app.disable('x-powered-by');
const port = 3000;

app.get('/fountains', getAllFountainsController );

app.get('/fountains/:id', getFountainByIdController );

app.get('/districts', getAllDistrictsController);

app.use(express.json());
app.post('/contact', sendContactEMailController);
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});