const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

function compare(clientVersion, serverVersion) {
  const [clientMajor, clientMinor = 0, clientPath = 0] = clientVersion
    .split(".")
    .map((x) => Number(x));

  const [serverMajor, serverMinor = 0, serverPath = 0] = serverVersion
    .split(".")
    .map((x) => Number(x));

  if (clientMajor !== serverMajor) {
    return false;
  }

  if (clientMinor !== serverMinor) {
    return false;
  }

  return clientPath < serverPath;
}

app.get("/:platform/:version", (req, res) => {
  const platformPath = `${__dirname}/versions/${req.params.platform}`;

  if (!fs.existsSync(platformPath)) {
    res.sendStatus(404);
    return;
  }

  const files = fs.readdirSync(platformPath);

  const availableVersion = files.find((x) => {
    const [version] = x.split(".zip");

    return compare(req.params.version, version);
  });

  if (!availableVersion) {
    res.sendStatus(404);
    return;
  }

  const archivePath = `${platformPath}/${availableVersion}`;

  if (fs.existsSync(archivePath)) {
    res.status(200).sendFile(archivePath);
  } else {
    res.sendStatus(404);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
