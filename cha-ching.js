var assert = require('assert'),
 os = require('os'),
 _u = require('underscore'),
 argv = require('optimist')
  .usage('Usage: $0 -c [config]')
  .demand(['c'])
  .alias('c', 'config')
  .describe('c', 'Path to a Javascript configuration file, e.g. ./config.js')
  .argv
;

var config = require(argv.config);

// Validate config:
// port: listens to HTTP POSTs on this port (e.g. 1337)
// path: listens to HTTP POSTs on this path (e.g. "/cha-ching")
// description: determines whether to include the Stripe payment description in the SMS message.
// smsNotifyees: array of phone #'s to send SMS message to on Stripe payment
// Twilio: object containing all necessary Twilio configuration properties
assert(config, 'Config not found');
assert(config !== null, 'Config is null');
assert(config.port, 'Config must specify "port"');
assert(config.port !== null, 'Config must specify "port"');
if (config.stripe) {
  assert(config.stripe.path, 'Config must specify "stripe.path"');
  assert(config.stripe.path !== null, 'Config must specify "stripe.path"');
  assert(config.stripe.description !== null, 'Config must specify "stripe.description"');
}
if (config.dwolla) {
  assert(config.dwolla.path, 'Config must specify "dwolla.path"');
  assert(config.dwolla.path !== null, 'Config must specify "dwolla.path"');
}
assert(config.smsNotifyees, 'Config must specify "smsNotifyees"');
assert(config.smsNotifyees !== null, 'Config must specify "smsNotifyees"');
if (!_u.isArray(config.smsNotifyees)) {
  config.smsNotifyees = eval(config.smsNotifyees);
}
assert(_u.isArray(config.smsNotifyees), 'Config property "smsNotifyees" must be an array of phone number strings');
assert(config.smsNotifyees.length > 0, 'Config property "smsNotifyees" must contain at least one value');
assert(config.Twilio, 'Config must specify property object "Twilio"');
assert(config.Twilio !== null, 'Twilio property object is null');
assert(config.Twilio.sid, 'Config must specify property object "Twilio.sid"');
assert(config.Twilio.sid !== null, 'Twilio property sid is null');
assert(config.Twilio.authToken, 'Config must specify property object "Twilio.authToken"');
assert(config.Twilio.authToken !== null, 'Twilio property authToken is null');
assert(config.Twilio.incoming, 'Config must specify property object "Twilio.incoming"');
assert(config.Twilio.incoming !== null, 'Twilio property incoming is null');
assert(config.Twilio.outgoing, 'Config must specify property object "Twilio.outgoing"');
assert(config.Twilio.outgoing !== null, 'Twilio property outgoing is null');
assert(config.Twilio.hostname, 'Config must specify property object "Twilio.hostname"');
assert(config.Twilio.hostname !== null, 'Twilio property hostname is null');

var express = require('express')
  , app = express.createServer()
  , util = require('util')
;
app.use(express.bodyParser());

var TwilioClient = require('twilio').Client
  , Twiml = require('twilio').Twiml
  , creds = config.Twilio
  , client = new TwilioClient(creds.sid, creds.authToken, creds.hostname, {
    'express' : app, // for Heroku support (i.e. listen on existing express port)
    'port' : config.port
  })
  , phone = client.getPhoneNumber(creds.outgoing)
;

phone.setup(function() {});

if (config.dwolla) {
  app.get('/'+config.dwolla.path, function(req, res) {
    // Move along, nothing to see here.
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("These aren't the droids you're looking for.\n");
  });
  app.post('/'+config.dwolla.path, function(req, res) {
    // Listens to this webhook: https://developers.dwolla.com/dev/pages/webhooks/transactionstatus
    console.log('Received Dwolla web-hook post');
    console.dir(req.body);
    if (!req.body.Id || !req.body.Value) {
      console.error("Invalid Dwolla POST: body must contain 'Id' and 'Value' keys");
      res.writeHead(400); 
      res.end();
      return;
    }    
    // Send SMS informing new purchase event:
    //TODO: lookup transaction by ID from Dwolla using API to get $ amount
    // var message = util.format('Cha-Ching! $%d.00 on %s', amount, creds.hostname);
    var message = util.format('Cha-Ching! Dwolla purchase %s on %s', req.body.Id, creds.hostname);
    if (req.body.Value === "processed") {
      config.smsNotifyees.forEach(function(smsNumber) {
        phone.sendSms(smsNumber, message, null, function(sms) {
          console.log('Sent SMS: "%s" from %s to %s', sms.body, sms.from, sms.to);
        });
      });
    }     
    res.writeHead(200); 
    res.end();
  });  
  console.log('Cha-Ching! Listening for Dwolla payments on http://%s:%d/%s', 
    creds.hostname, config.port, config.dwolla.path);    
}

if (config.stripe) {
  app.get('/'+config.stripe.path, function(req, res) {
    // Move along, nothing to see here.
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("These aren't the droids you're looking for.\n");
  });
  app.post('/'+config.stripe.path, function(req, res) {
    console.log('Received Stripe web-hook post');
    console.dir(req.body);
    if (!req.body.data || req.body.data === null || !req.body.data.object || req.body.data.object === null) {
      console.error("Invalid Stripe POST: body must contain 'data' which must contain 'object'");
      res.writeHead(400); 
      res.end();
      return;
    }
    // Send SMS informing new purchase event:
    var event = req.body.data;
    var payment = event.object;
    var amount = payment.amount / 100;
    var message = util.format('Cha-Ching! $%d.00 on %s', amount, creds.hostname);
    if (config.stripe.description) {
      message += ' for ' + payment.description;
    }
    if (req.body.type === "charge.succeeded") {
      config.smsNotifyees.forEach(function(smsNumber) {
        phone.sendSms(smsNumber, message, null, function(sms) {
          console.log('Sent SMS: "%s" from %s to %s', sms.body, sms.from, sms.to);
        });
      });
    } 
    res.writeHead(200); 
    res.end();    
  });
  console.log('Cha-Ching! Listening for Stripe payments on http://%s:%d/%s', 
    creds.hostname, config.port, config.stripe.path);  
}

app.listen(config.port);
