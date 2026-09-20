import '../config/env.ts'

import express, { type Express, type Request, type Response } from 'express';

import { transporter } from '../config/transporter.ts';

import { getAllFountainsController,getFountainByIdController } from './Controller/fountainController.ts';
import { getAllDistrictsController }from './Controller/districtController.ts'

const app: Express = express();
app.disable('x-powered-by');
const port = 3000;

app.get('/fountains', getAllFountainsController );

app.get('/fountains/:id', getFountainByIdController );

app.get('/districts', getAllDistrictsController);

app.use(express.json());
app.post('/contact', async(req: Request, res: Response) => {  
  if (req.body.name && req.body.email && req.body.subject&& req.body.message){
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
  }else{    
    console.error("Input fields not valid:");
    res.status(400).json({error : "Champs non valides"});
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});