const Router = require('express').Router;
const translate = require('google-translate-api');

module.exports = () => {
  const api = Router();
  
  api.post('/translate', (req, res) => {
    translate(req.body.message, {to: req.body.language}).then(response => {
      res.json({data: response, success: true, error: false});
    }).catch(error => {
      console.error(error);
      res.json({data: null, success: false, error});
    });
  });

  return api;
}