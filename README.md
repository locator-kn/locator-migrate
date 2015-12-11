# locator-migrate

this repo contains code to migrate the data for [locator-app.com](https://locator-app.com) from couchdb to mongodb.

## What to do?

The following assumes you have all documents downloaded from the current couchdb and named the result `allData.json`.

clone repo and cd into
```
git clone https://github.com/locator-kn/locator-migrate.git && cd $_
```

install dependencies
```
npm i
```

split up the data by type and do some cleanup

```
node index.js
```

now you should find the split up data in the `olddata` directory

now, you can run the files you want to have in your local mongo, eg.:
```
node transformer/user.js
```