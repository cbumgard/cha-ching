module.exports = {
  Twilio: {
    sid: process.env.TWILIO_SID || '',              // twilio account sid (available on your twilio.com dashboard)
    authToken: process.env.TWILIO_AUTH_TOKEN || '', // twilio authtoken (available on your twilio.com dashboard)
    incoming: process.env.TWILIO_INCOMING || '',    // incoming twilio phone #
    outgoing: process.env.TWILIO_OUTGOING || '',    // outgoing twilio phone #
    hostname: process.env.TWILIO_HOSTNAME || ''     // e.g. mydomain.com -- this MUST match your twilio app's hostname setting or you won't actually get an SMS
  },
  port: process.env.PORT || 80,         // port to listen for HTTP web-hook POSTs from Stripe and/or Dwolla. Must be 80 or 443 for Dwolla to work.
  smsNotifyees: process.env.SMS_NOTIFYEES || [],  // phone #'s to notify via SMS
  stripe: { // <- remove this object to not listen for Dwolla web-hooks
    path: process.env.STRIPE_PATH || 'cha-ching/stripe', // path to listen for HTTP web-hook POSTs, i.e. 'http://yourhost.com/cha-ching/stripe'
    description: process.env.STRIPE_DESCRIPTION || true, // if true, includes Stripe payment field 'description'. useful if you include info in this field such as customer name
  },
  dwolla: { // <- remove this object to not listen for Dwolla web-hooks
    path: process.env.DWOLLA_PATH || 'cha-ching/dwolla', // Responds to a Transaction Status webhook (https://developers.dwolla.com/dev/pages/webhooks/transactionstatus)
  }  
};
