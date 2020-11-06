# Amazon Transcribe & Comprehend sample client application

Use this sample application to connect to a Transcribe & Comprehend connector for real time transcription and sentiment analysis of voice calls.

## About this sample application

This sample client application makes use of Vonage Voice API to establish voice calls and set up websockets connections to stream audio to the Transcribe & Comprehend connector server then get back in real time transcipts and sentiment scores.

The connector posts back in real time transcripts and optionally sentiment scores, via a webhook call back to this Vonage Voice API sample client application.

Once this application will be running, you test as follows:</br>
- Have 2 phones available (ideally first one with you, second one remote with someone else, or conversely),</br>
- From the first phone, call in to the **`phone number linked`** to your application (as explained below), that party will act as the "customer",</br>
- The second phone will automatically get called, that party will act as the "agent",</br>
- Both parties can speak to each other,</br>
- Each PSTN (Public Switched Telephone Network) call leg will have a corresponding Websocket call leg listening only to that party for audio streaming to the connector, all four legs are connected to the same conference,</br>
- Transcript and sentiment scores of each party will be received by this application in real time,</br>
- When the initial caller (first phone) hangs up, both PSTN and both Websocket legs will be automatically terminated.

## Set up the connector server - Public hostname and port

First set up a Transcribe & Comprehend connector server from https://github.com/nexmo-se/vg-transcribe-comprehend.

Default local (not public!) sample application `port` is: 8000.

If you plan to test using `Local deployment` with ngrok for both the connector application and this sample application, you may set up [multiple ngrok tunnels](https://ngrok.com/docs#multiple-tunnels).

For the next steps, you will need:
- The Transcribe & Comprehend connector server's public hostname and if necessary public port,</br>
e.g. `xxxxxxxx.ngrok.io`, `xxxxxxxx.herokuapp.com`  (as **`TRANSCRIBE_COMPREHEND_CONNECTOR_SERVER`**, no `port` is necessary with ngrok or Heroku as public hostname)

## Client application public hostname and port

Default local (not public!) sample application `port` is: 8000.

If you plan to test using `Local deployment` with ngrok for both this sample application and the connector application, you may set up [multiple ngrok tunnels](https://ngrok.com/docs#multiple-tunnels).

For the next steps, you will need:
- The server's public hostname and if necessary public port on where this application is running,</br>
e.g. `yyyyyyyy.ngrok.io`, `yyyyyyyy.herokuapp.com` (as `host`), no `port` is necessary with ngrok or Heroku as public hostname.

## Set up your Vonage Voice API client application credentials and phone number

[Log in to your](https://dashboard.nexmo.com/sign-in) or [sign up for a](https://dashboard.nexmo.com/sign-up) Vonage APIs account.

Go to [Your applications](https://dashboard.nexmo.com/applications), access an existing application or [+ Create a new application](https://dashboard.nexmo.com/applications/new).

Under Capabilities section (click on [Edit] if you do not see this section):

Enable Voice
- Under Event URL, select HTTP POST, and enter https://\<host\>:\<port\>/event (replace \<host\> and \<port\> with the public host name and if necessary public port of the server where your application is running)</br>
- Under Answer URL, leave HTTP GET, and enter https://\<host\>:\<port\>/answer (replace \<host\> and \<port\> with the actual value as mentioned above)</br>
- Click on [Generate public and private key] if you did not yet create or want new ones, save the private.key file in this application folder.</br>
IMPORTANT: Do not forget to click on [Save changes] at the bottom of the screen if you have created a new key set.</br>
- Link a phone number to this application if none has been linked to the application.

Please take note of your **application ID** and the **linked number** (as they are needed in the very next section.)

For the next steps, you will need:</br>
- Your `application ID` (as **`APP_ID`**),</br>
- The **`phone number linked`** to your application (your first phone will **call that number**),</br>
- Your [Vonage API key](https://dashboard.nexmo.com/settings) (as **`API_KEY`**)</br>
- Your [Vonage API secret](https://dashboard.nexmo.com/settings), not signature secret, (as **`API_SECRET`**)</br>
- The Transcribe & Comprehend connector server public hostname and port (as **`TRANSCRIBE_COMPREHEND_CONNECTOR_SERVER`**)</br>
- If you did not yet add funds since you created your account, the [Phone number](https://dashboard.nexmo.com/edit-profile) under your profile (do not confuse with the **`phone number linked`** to your application) must be used as **`CALLEE_NUMBER`** (i.e. the 2nd phone that gets called),</br>
otherwise you may enter any desired callee phone number as **`CALLEE_NUMBER`**.</br>
That callee number must be in E.164 format, for example:</br>
12995550101 (11-digit number starting with 1 for a US/Canada phone number)</br>
44xxx..xxxxx (number starting with 44 for a UK phone number)</br>
33xxxxxxxxx (11-digit number starting with 33 for a France phone number)

## Running Transcribe & Comprehend client application

You may select one of the following 2 types of deployments.

### Local deployment

To run your own instance locally you'll need an up-to-date version of Node.js (we tested with version 14.3.0).

Copy the `.env.example` file over to a new file called `.env`:
```bash
cp .env.example .env
```

Edit `.env` file, and set the 5 parameter values:</br>
API_KEY=</br>
API_SECRET=</br>
APP_ID=</br>
TRANSCRIBE_COMPREHEND_CONNECTOR_SERVER=</br>
CALLEE_NUMBER=</br>

Install dependencies once:
```bash
npm install
```

Launch the applicatiom:
```bash
node transcribe-comprehend-client
```

### Command Line Heroku deployment

Copy the `.env.example` file over to a new file called `.env`:
```bash
cp .env.example .env
```

Edit `.env` file, and set the 5 parameter values:</br>
API_KEY=</br>
API_SECRET=</br>
APP_ID=</br>
TRANSCRIBE_COMPREHEND_CONNECTOR_SERVER=</br>
CALLEE_NUMBER=</br>

If you do not yet have a local git repository, create one:</br>
```bash
git init
git add .
git commit -am "initial"
```

Deploy this client application to Heroku from the command line using the Heroku CLI:

```bash
heroku create myappname
```

On your Heroku dashboard where your client application page is shown, click on `Settings` button,
add the following `Config Vars` and set them with their respective values:</br>
API_KEY</br>
API_SECRET</br>
APP_ID</br>
TRANSCRIBE_COMPREHEND_CONNECTOR_SERVER</br>
CALLEE_NUMBER</br>

```bash
git push heroku master
```

On your Heroku dashboard where your application page is shown, click on `Open App` button, that hostname is the one to be used under your corresponding [Vonage Voice API application Capabilities](https://dashboard.nexmo.com/applications) (click on your application, then [Edit]).</br>
See more details in above section **Set up your Vonage Voice API client application credentials and phone number**.
