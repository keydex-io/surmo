
/// A parser for JSON request body
/// [res]     - uWebSockets HTTPResponse
/// [cb]      - See [bodyParser]
/// Must register an onAborted handler prior using it!
/// Originally written by the uWebSocket.js authors and improved by the library author
function jsonParser(res, cb, options={}) {
  let buffer;
  /* Register data cb */
  res.onData((ab, isLast) => {
    let chunk = Buffer.from(ab);
    if (isLast) {
      let json;
      if (buffer) {
        try {
          json = JSON.parse(Buffer.concat([buffer, chunk]));
        } catch (e) {
          console.error(e);
          res.close();
          return;
        }
        cb(json, true);
      } else {
        try {
          json = JSON.parse(chunk);
        } catch (e) {
          console.error(e);
          res.close();
          return;
        }
        cb(json, true);
      }
    } else {
      if (buffer) {
        buffer = Buffer.concat([buffer, chunk]);
      } else {
        buffer = Buffer.concat([chunk]);
      }
    }
  });
}

export function bodyParser(res, req, cb, err=()=>{}, options={ asJson: true }) {
  // Register error callback - res.close also calls onAborted
  res.onAborted(() => {
    res.aborted = true;
    err();
  });

  jsonParser(res, cb, options);
};
