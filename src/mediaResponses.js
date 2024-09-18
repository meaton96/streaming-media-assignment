const fs = require('fs');
const path = require('path');

const getMimeType = (extension) => {
  switch (extension.toLowerCase()) {
    case 'mp4':
    case 'm4v':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'ogg':
      return 'video/ogg';
    case 'avi':
      return 'video/x-msvideo';
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'aac':
      return 'audio/aac';
    case 'flac':
      return 'audio/flac';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
};

const handle404 = (response, error) => {
  if (error.code === 'ENOENT') {
    // File not found, serve 404 page
    const notFoundPath = path.resolve(__dirname, '../client/404.html');
    fs.readFile(notFoundPath, (readErr, content) => {
      if (readErr) {
        // If 404 page is not found, send a simple text response
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        return response.end('404 Not Found');
      }
      // Serve the 404 page
      response.writeHead(404, { 'Content-Type': 'text/html' });
      return response.end(content);
    });
    return;
  }
  // For other errors, send the error message
  response.writeHead(500, { 'Content-Type': 'text/plain' });
  return response.end(`Server Error: ${error.message}`);
};
const getMedia = (request, response, endpoint) => {
  const file = path.resolve(__dirname, `../client/${endpoint}`);
  const fileExtension = path.extname(file).slice(1);
  const contentType = getMimeType(fileExtension);

  fs.stat(file, (err, stats) => {
    if (err) {
      return handle404(response, err);
    }

    let { range } = request.headers;
    if (!range) {
      range = 'bytes=0-';
    }
    const positions = range.replace(/bytes=/, '').split('-');
    let start = parseInt(positions[0], 10);
    const total = stats.size;
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    if (start > end) {
      start = end - 1;
    }
    const chunksize = (end - start) + 1;
    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    });
    const stream = fs.createReadStream(file, { start, end });
    stream.on('open', () => {
      stream.pipe(response);
    });
    stream.on('error', (streamErr) => {
      response.writeHead(500, { 'Content-Type': 'text/plain' });
      response.end(`Server Error: ${streamErr.message}`);
    });
  });
};

module.exports.getMedia = getMedia;
