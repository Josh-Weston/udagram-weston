import express from 'express';
import bodyParser from 'body-parser';
import { URL } from 'url'
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import { generateJWT, authenticationMiddleware } from './authentication';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
  /**************************************************************************** */
  app.get('/filteredimage', authenticationMiddleware, async (req, res) => {
    const urlImage = req.query.image_url;
    try {
      new URL(urlImage); // validate URL
      const filteredImage = await filterImageFromURL(urlImage);
      res.sendFile(filteredImage, err => {
        if (err) {
          console.log(err);
        }
        deleteLocalFiles([ filteredImage ]);
      });
    } catch (err) {
      res.status(500).send(`There was an error filtering the requested image. ${err}`);
    }
  });
  //! END @TODO1

  // STAND OUT (AUTHENTICATION)
  // Sends the user a generic token that never expires
  app.get('/token', async(_, res) => {
      res.status(200).send(generateJWT());
  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async (_, res) => {
    res.status(200).send("try GET /filteredimage?image_url={{}}")
  } );
  
  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();
