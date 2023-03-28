import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import body_parser from 'body-parser';
import exif_parser from 'exif-parser';
import fs from 'fs';


dotenv.config();


const app: Express = express();
const port = process.env.PORT || 3000;


const get_img_metadata_by_id = async (img_id: Number) => {
  return new Promise((resolve, reject) => {
    fs.readFile(`images/${img_id}.jpg`, (err, data) => {
      resolve(exif_parser.create(data).parse());
    });
  });
}

app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

app.get('/img/:id', async (req: Request, res: Response) => {
  const img_id = parseInt(req.params.id);
  console.log(`requesting image ${img_id}`);
  get_img_metadata_by_id(img_id).then((img_metadata) => {
    console.log(img_metadata);
    res.send(JSON.stringify(img_metadata, null, 2));
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
