# streamline-express

An Express 3.x patch for using streamline.

## Installation

```bash
$ npm install streamline-express
```

## Example

```js
var express = require("express");

var app = require("streamline-express")(express());

// Both streamline pattern handlers, and normal pattern handlers are supported.
app.get("/root", function(req, res, _) {
  setTimeout(_, 1000);
  console.log("/root");
  res.send("root OK");
});

app.get("/root2", function(req, res) {
  console.log("root 2");
  res.send("root 2");
});

app.get("/", function(req, res, next, _) {
  setTimeout(_, 2000);
  console.log("/");
  if (!req.query.c) next("route");
}, function(req, res) {
  console.log("next /");
  res.send("OK");
});
```

## Notice

You can use normal patterns as well as streamline patterns for routing, however, if you use (req, res, next) pattern, beware that the third argument's name has to be **next**.

## License

(The MIT License)

Copyright (c) 2013 Seth Yuan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
