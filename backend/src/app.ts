import '../config/env.ts'

import express, { type Express, type Request, type Response } from 'express';
import { client } from '../config/database.ts'
import { transporter } from '../config/transporter.ts';

const app: Express = express();
app.disable('x-powered-by');
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.get('/fountains', async(req: Request, res: Response) => {
  
  const filters = {
    city: req.query.city,
    district: req.query.district,
    type: req.query.type,
    status: req.query.status,
  };
  let conditions: string[] = [];
  let values: string[] = [];
  
  for (const [key, value] of Object.entries(filters)) {
    if (typeof value === 'string') {
      values.push(value);
      conditions.push(`${key} = $${values.length}`);
    }
  }
    
  let listConditions = "";
  
  for(let i=0; i < conditions.length; i++){    
    if (i===0){
      listConditions += ` WHERE ${conditions[i]}`;
    } else {
      listConditions += ` AND ${conditions[i]}`;
    }     
  }  
  const result = await client.query(
    `SELECT *
     FROM fountain ${listConditions}`, 
    values);
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
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      replyTo: req.body.email,
      to: process.env.SMTP_USER, 
      subject: req.body.subject, 
      text: `Nom: ${req.body.name}\nEmail: ${req.body.email}\nMessage: ${req.body.message}`, 
    });
    res.json(req.body);
    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Error while sending mail:", err);
    res.status(500).json({error : "Erreur pendant l'envoi de l'e-mail"});
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});