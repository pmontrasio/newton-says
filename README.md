newton-says
===========

Source code for http://connettiva.eu/newton/

The required files ```planet.js```, ```planet.js.mem``` and ```planet.js.symbols``` are built by the code
in the [astronomical-almanac-js](https://github.com/pmontrasio/astronomical-almanac-js) repository.

A working version is provided in this repository but refer to [astronomical-almanac-js](https://github.com/pmontrasio/astronomical-almanac-js) for the latest one.

Configuring, building, running and deploying
-------------------------------

Configuration: edit the facebook meta tags at the beginning of ```index.html```, especially the app id: you want to use your one, start at https://developers.facebook.com/apps

Build: there is nothing to build.

The prerequisites to running the web app locally and to deploying it on a remote server are

    sudo npm install -g browserify
    sudo npm install -g beefy
    sudo npm install -g uglifyjs
    git clone <this repository>
    cd newton-says
    npm install

To run the web app

    beefy newton-client.js:newton-client.bundle.js # listens on 127.0.0.1:9966

or something like this to test with a phone/tablet

    beefy newton-client.js:newton-client.bundle.js --url http://192.168.1.131:9966

To deploy it on a server you can copy the files listed in MANIFEST.
This script automates it:

    #!/bin/sh
    ./node_modules/.bin/browserify newton-client.js | uglifyjs -c -m > newton-client.bundle.js
    rsync -av --files-from=MANIFEST ./ your_account@your_server:/your/directory/newton

TO DO
-----

Find a way to include ```planet.js``` into the bundle instead of loading it separately.

License
-------

This web app is (C) Paolo Montrasio 2015 and is licensed under the [GNU Affero General Public License 3.0](http://www.gnu.org/licenses/agpl-3.0.txt).
