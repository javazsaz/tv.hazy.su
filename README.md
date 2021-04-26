# tv.hazy.su

my solution for a youtube client. work in progress!

## setup

- clone the repo
- create a config file (use ``config.json.example`` as a reference)
- in a terminal, run ``npm i`` to install dependencies
- run ``node index.js`` to start the program.
The repo port is defined by the ``config.json`` unless an environment variable named "PORT" exists, meaning heroku works with no changes.

## heroku

heroku is nearly fully supported with no changes necessary.
##### api/stats
what doesn't work is the api/stats endpoint, as heroku clears all file changes
around every 24 hours, which would remove all the statistics data.
the endpoint still exists, but the data is cleared daily by heroku.

## future things
###### in no particular order

- improve video proxying
- list youtube comments (?)
