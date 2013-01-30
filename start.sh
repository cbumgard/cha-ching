#!/bin/bash

# You must set an actual value for each variable below, or remove them and set them in a config.js file.
# It's recommended to put them in environment variables to keep them out of source control and allow easy deployment and integration to a hosted environment such as Heroku.
# By default it tries to listen on port 80, which is needed to subscribe to Dwolla's webhooks.
TWILIO_SID='SID' TWILIO_AUTH_TOKEN='AUTH_TOKEN' TWILIO_INCOMING='+INCOMING_PHONE_NUMBER' TWILIO_OUTGOING='+OUTGOING_PHONE_NUMBER' TWILIO_HOSTNAME='APP_HOSTNAME' SMS_NOTIFYEES='["+PHONE_NUMBER_1","+PHONE_NUMBER_2"]' node cha-ching.js -c ./config.js
