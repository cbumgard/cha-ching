# cha-ching!

There's nothing like constant cha-ching SMS messages to your phone.

## Overview

A node.js server app that listens for successful Stripe and/or Dwolla purchases and responds by notifying a list of people via Twilio SMS text messages. Designed for easy integration and deployment to Heroku, although should work with any node.js hosting platform. Originally wrote this for my business [AskYourUsers.com](https://www.askyourusers.com/).

## Configuration

* To use only Stripe or only Dwolla, remove the other one from the config.js file. I.e. for Dwolla only, remove the entire 'stripe: {..}' object.
* For Dwolla, the only allowable ports are 80 and 443. This is not a problem on Heroku, as it passes in the PORT env variable which is bound for Express and Twilio and externally is reached via port 80.
* Recommended: set all config via environment variables rather than put into files that may end up in source control. This is better if you're deploying to an environment such as Heroku as you can set the env var settings once for the app then continually just push your changes.

For example setting these once for Heroku then deploying (all of these values must be changed to your settings):

    heroku config:add TWILIO_SID='...'
    heroku config:add TWILIO_AUTH_TOKEN='...'
    heroku config:add TWILIO_INCOMING='+15555555555'
    heroku config:add TWILIO_OUTGOING='+15555555555'
    heroku config:add TWILIO_HOSTNAME='yourdomain.com'
    heroku config:add SMS_NOTIFYEES='["+15555555555", "+15555555555"]'

## Installation

Run `npm install` to download dependencies.

## Starting

Then you can start cha-ching in several ways:

### Heroku style (based on ./Procfile):

> foreman start

### Bash script:

> ./start.sh

### Manually (must include "./" if in current directory):

> node cha-ching.js -c ./config.js

## Deploying

For Heroku, assuming you have done `heroku login` and `heroku create` as well as the `heroku config:add ...` commands in the configuration section above, just run:

`git push heroku master`

That's it! Then setup your web-hook subscriptions and test using cURL (both described below).

## Setup Web-Hook Subscriptions

* In your Stripe account settings add this as a webhook: http://[host]:[port]/cha-ching/stripe
* In your Dwolla account settings add this as a webhook: http://[host]:[port]/cha-ching/dwolla
* Change the port and path accordingly if you change them in your config.js

## Testing: cURL

Note you need to change the [host] and [port] values in the examples below. Please note for Dwolla, the only allowable ports are 80 and 443, so these are recommended and used by default.

### Dwolla

    curl -H "Content-Type: application/json" -X POST -d '{ "Created": "1/30/2013 5:00:39 PM", "Id": "1810661", "Subtype": "Status", "Triggered": "1/30/2013 5:00:39 PM", "Type": "Transaction", "Value": "processed" }' http://<host>:<port>/cha-ching/dwolla

### Stripe

    curl -H "Content-Type: application/json" -X POST -d '{"created": 1326853478, "livemode": false, "id": "evt_00000000000000", "type": "charge.succeeded", "object": "event", "data": { "object": { "id": "ch_00000000000000", "object": "charge", "created": 1359535409, "livemode": false, "paid": true, "amount": 10000, "currency": "usd", "refunded": false, "fee": 320, "fee_details": null, "card": null, "failure_message": null, "amount_refunded": 0, "customer": null, "invoice": null, "description": "Testing Cha-Ching Stripe Webhook", "dispute": null } } }' http://<host>:<port>/cha-ching/stripe