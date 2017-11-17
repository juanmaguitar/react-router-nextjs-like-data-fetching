import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter, matchPath } from 'react-router-dom';

import App from './App';
import routes from './routes';

import getIndexHtml  from './utils/getIndexHtml'

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);
const server = express();

server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', async (req, res) => {
    // This data fetching technique came from a gist by @ryanflorence
    // @see https://gist.github.com/ryanflorence/efbe562332d4f1cc9331202669763741

    // First we iterate through our top level routes
    // looking for matches against the current url.

    const matchesDataPromises = routes.map( route => {
      const match = matchPath(req.url, route.path, route)
      // We then look for static getInitialData function on each top level component
      if (match) {
        const promise = route.component.getInitialData
                          ? route.component.getInitialData({ match, req, res })
                          : Promise.resolve(null)
        return promise;
      }
      return null;
    });

    if (matchesDataPromises.length === 0) {
      res.status(404).send('Not Found');
    }

    // We block rendering until all promises have resolved
    try {
      const data = await Promise.all(matchesDataPromises)
      const context = {};
  
      // Pass our routes and data array to our App component
      const markup = renderToString(
        <StaticRouter context={context} location={req.url}>
          <App routes={routes} initialData={data} />
        </StaticRouter>
      );

      const indexHtml = getIndexHtml(assets, markup, data)
      res.status(context.statusCode || 200).send(indexHtml)
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message, stack: error.stack });
    }

  })

export default server;
