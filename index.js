const request = require('request');
const zlib = require('zlib');
const { Console } = require("console");
const fs = require("fs");

exports.printMsg = function() {
  console.log("This is a message from the demo package");
}

const myLogger = new Console({
  stdout: fs.createWriteStream("normalStdout.txt"),
  stderr: fs.createWriteStream("errStdErr.txt"),
});

exports.runGetStock = async(url, proxy_url) => {
  return new Promise((resolve, reject) => {
    let options = {
      // proxy: proxy_url,
      url: url,
      encoding: null,
    }
    request(options, (error, response, body) => {
      if(response===undefined){
        console.error('response is undefined');
        reject(new Error('response is undefined'));
        return ;
      }
      // console.log(response.statusCode,url);
      if (error) {
        console.error('Error sending action: ', error);
        reject(error);
      } else if (response.body.error) {
        console.error('Error: ', response.body.error);
        reject(new Error(response.body.error));
      } else {
        let is_gzip = 'ungzip';
        // console.log(response.headers);
        if(response.headers['content-encoding'] === 'gzip'){
          is_gzip = 'gzip';
          var buf = Buffer.from(body);
          body = zlib.unzipSync(buf).toString();
        } else {
          body = Buffer.from(body).toString();
        }
        var result = null;
        if(body.indexOf('id="captchacharacters"')!=-1){
          result = 'captcha';
        } else if(body.indexOf('id="add-to-cart-button"')!=-1){
          result = 'add-to-cart';
        }
        myLogger.log(new Date().toLocaleString(),is_gzip,response.statusCode,url,result);
        console.log(is_gzip,response.statusCode,url,result);
        // console.log(body);
        resolve(body);
      }
    });
  });
}