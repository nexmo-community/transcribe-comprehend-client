'use strict';

let fs = require('fs');
let request = require('request');

require("dotenv").config();

const express = require('express');
let bodyParser = require('body-parser');

const app = express();

let Nexmo = require('nexmo');

const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;
const appId = process.env.APP_ID;
const transcribeComprehendServer = process.env.TRANSCRIBE_COMPREHEND_REFERENCE_CONNECTION;
const calleeNumber = process.env.CALLEE_NUMBER;

const port = process.env.PORT || 8000;

const privateKey = require('fs').readFileSync('private.key');

const nexmo = new Nexmo({
  apiKey: apiKey,
  apiSecret: apiSecret,
  applicationId: appId,
  privateKey: privateKey
});

//-----------

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//-----------

app.get('/answer', (req, res) => {

  const hostName = `${req.hostname}`;
  const uuid = req.query.uuid;
  
  res.json(
    [
      {
        "action": "talk",
        "voiceName": "Joanna",
        "text": "Please wait, we are connecting your call"
      }
      ,
      {
        "action": "conversation",
        "name": "conf_" + uuid,
        "endOnExit": true
      }
    ]
  );

  nexmo.calls.create(
    {
      to: [
        {
        type: "phone",
        number: calleeNumber
        }
      ],
      from: {
       type: "phone",
       number: req.query.to
      },
      answer_url: ["https://" + hostName + "/callee_answer?original_uuid=" + uuid],
      answer_method: "GET",
      event_url: ["https://" + hostName + "/callee_event?original_uuid=" + uuid],
      event_method: "POST"
    }, (err, res) => {
      if (err) {console.error("Outgoing call failed:", err)}
      else {console.log("Outgoing call status:", res)}
      }
    );

});

//------------

app.post('/event', (req, res) => {

  if (req.body.type == "transfer"){

    const hostName = `${req.hostname}`;
    const uuid = req.body.uuid

    nexmo.calls.create(
      {
        to: [
          {
            type: "websocket",
            uri: "wss://" + transcribeComprehendServer,
            "content-type": "audio/l16;rate=8000",
            headers:
              {
              "webhook_url": "https://" + hostName + "/stt_sentiment", // transcript and sentiment result webhook call back
              "client_id": uuid, // optional parameter, default is ""
              // 'client_id': uuid + '_' + req.query.from,
              "entity": "customer", // optional parameter, default is "" -- e.g. "customer", "agent", "supervisor", "buyer", "technician", ...
              "sensitivity": 3,  // optional parameter, voice activity detection, possible values 0 (most sensitive) to 3 (least sensitive - default value)
              "do_sentiment": true // optional parameter, if set to false, only transcription is requested
              }      
          }
        ],
          from: {
           type: "phone",
           number: 12995550101  // dummy number, value does not matter
          },
          answer_url: ["https://" + hostName + "/ws_answer1?original_uuid=" + uuid],
          answer_method: "GET",
          event_url: ["https://" + hostName + "/ws_event1?original_uuid=" + uuid],
          event_method: "POST"
        }, (err, res) => {
          if (err) {console.error("Websoket 1 failed:", err)}
          else { console.log("Websoket 1 status:", res)}
      }
    );
  }

  res.status(200).send('Ok');
  
});

//------------

app.get('/ws_answer1', (req, res) => {

  const originalUuid = req.query.original_uuid;
 
  res.json(
    [
      {
        "action": "conversation",
        "name": "conf_" + originalUuid,
        "canHear": [originalUuid] // stream only caller's audio to this websocket
      }
    ]
  );

});

//-----------

app.post('/ws_event1', (req, res) => {
 
  res.status(200).send('Ok');

});

//------------

app.get('/callee_answer', (req, res) => {

    const hostName = `${req.hostname}`;
    const originalUuid = req.query.original_uuid;
    const uuid = req.query.uuid;

    res.json([
      {
        "action": "talk",
        "voiceName": "Joanna",
        "text": "We are connecting you to the caller"
      }
      ,    
      {
        "action": "conversation",
        "name": "conf_" + originalUuid
      }
    ]);

});

//------------

app.post('/callee_event', (req, res) => {

  res.status(200).send('Ok');

  if (req.body.type == "transfer"){

    const hostName = `${req.hostname}`;
    const uuid = req.body.uuid;
    const originalUuid = req.query.original_uuid;

    nexmo.calls.create(
      {
        to:
          [{
          type: "websocket",
          uri: "wss://" + transcribeComprehendServer,
          "content-type": "audio/l16;rate=8000",
          headers:
            {
            "webhook_url": 'https://' + hostName + '/stt_sentiment', // transcript and sentiment result webhook call back
            "client_id": uuid, // optional parameter, default is ""
            // "client_id": uuid + "_" + req.query.from,
            "entity": "agent", // optional parameter, default is "" -- e.g. "customer", "agent", "supervisor", "buyer", "technician", ...
            "sensitivity": 3,  // optional parameter, voice activity detection, possible values 0 (most sensitive) to 3 (least sensitive - default value)
            "do_sentiment": true // optional parameter, if set to false, only transcription is requested
            },         
          }],
        from: {
         type: "phone",
         number: 12995550101  // dummy number, value does not matter
        },
        answer_url: ["https://" + hostName + "/ws_answer2?original_uuid=" + originalUuid + '&callee_uuid=' + uuid],
        answer_method: "GET",
        event_url: ["https://" + hostName + "/ws_event2?original_uuid=" + originalUuid + '&callee_uuid=' + uuid],
        event_method: "POST"
        }, (err, res) => {
          if (err) {console.error("Websocket 2 failed:", err); }
          else { console.log("Websocket 2 status:", res); }
      }
    );
  }

});

//------------

app.get('/ws_answer2', (req, res) => {
 
  res.json(
    [{
      "action": "conversation",
      "name": "conf_" + req.query.original_uuid,
      "canHear": [req.query.callee_uuid]    // stream only callee's audio to this websocket
    }]
  );

});

//------------

app.post('/ws_event2', (req, res) => {
 
  res.status(200).send('Ok');  

});

//-----------

app.post('/stt_sentiment', (req, res) => {

  console.log(">>> Transcript and sentiment score:", req.body);
 
  res.status(200).send('Ok');

});

//-------

app.use ('/', express.static(__dirname));

//--------

app.listen(port, () => console.log(`Application listening on port ${port}!`));