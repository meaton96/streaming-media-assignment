const http = require('http');
const path = require('path');
const htmlHandler = require('./htmlResponses.js');
const mediaHandler = require('./mediaResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const isMedia = (endpoint) => {
  const extension = path.extname(endpoint).slice(1).toLowerCase();
  const mediaExtensions = [
    'mp4', 'm4v', 'webm', 'ogg', 'avi', // Video
    'mp3', 'wav', 'aac', 'flac', // Audio
    'jpg', 'jpeg', 'png', 'gif', 'webp', // Images
  ];
  return mediaExtensions.includes(extension);
};
const onRequest = (request, response) => {
  console.log(request.url);
  switch (request.url) {
    case '/':
      htmlHandler.getIndex(request, response);
      break;
    case '/page2':
      htmlHandler.getPage2(request, response);
      break;
    case '/page3':
      htmlHandler.getPage3(request, response);
      break;
    default:
      if (isMedia(request.url)) {
        mediaHandler.getMedia(request, response, request.url);
      } else {
        htmlHandler.getIndex(request, response);
      }
      break;
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
