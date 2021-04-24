# tv.hazy.su
my solution for a youtube client. work in progress!

## setup

to use this, clone the repo and make a ``.env`` file.
inside the ``.env`` file, put this:
```env
DISCORD=YOUR BOT TOKEN
ERROR=DISCORD CHANNEL ID
NEW_ERROR=DISCORD CHANNEL ID
```
replace the "YOUR BOT TOKEN" with a Discord bot token (Discord bot used to log errors).
ERROR is a channel ID for logging known errors, NEW_ERROR is a channel ID used for logging unknown errors.

In a terminal, run ``npm i`` to install dependencies. Finally, run ``node index.js`` to run the code.
Go to the URL ``127.0.0.1:3009`` in a browser and you will see it running.

## future things
###### in no particular order

- add config.json to allow people to disable Discord bot logs
- add setting to site to disable logging errors in general (per user)
- improve video proxying
- list youtube comments (?)
