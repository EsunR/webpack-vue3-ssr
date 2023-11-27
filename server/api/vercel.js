// import {app} from '../server';

// export default (req: any, res: any) => {
//     return app(req, res);
// };
const app = require('express')();

app.get('/api/item/:slug', (req, res) => {
  const { slug } = req.params;
  res.end(`Item: ${slug}`);
});

module.exports = app;