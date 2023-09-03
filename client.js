const qrcode = require('qrcode-terminal');
const {phoneNumberFormatter} = require('./helpers/formatter')
const { Client } = require('whatsapp-web.js');
const client = new Client();
const express = require('express')

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));


const checkRegisteredNumber = async function(number) {
    const isRegistered = await client.isRegisteredUser(number);
    return isRegistered;
  }

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize()

app.post('/is-registered' , async (req, res) => {
  const number = phoneNumberFormatter(req.body.number);
  const isRegistered = await client.isRegisteredUser(number);
  if (!isRegistered) {
    return res.status(422).json({
      status: false,
      message: 'The number is not registered'
    });
  }
  else{
    return res.status(200).json({
      status: true,
      message: 'The number is registered'
    });

  }
})

app.post('/send-message' , async (req, res) => {

    console.log(req.body);
    const number = phoneNumberFormatter(req.body.number);
    const message = req.body.message;

    const isRegisteredNumber = await checkRegisteredNumber(number);


    if (!isRegisteredNumber) {
        return res.status(422).json({
          status: false,
          message: 'The number is not registered'
        });
      }
    
      client.sendMessage(number, message).then(response => {
        res.status(200).json({
          status: true,
          response: response
        });
      }).catch(err => {
        res.status(500).json({
          status: false,
          response: err
        });
      });

      

})

client.on('message', msg => {
  if (msg.body == 'ping') {
      msg.reply('pong');
  }
});

app.listen(5202 , ()=> {
    console.log(`Server is listening on http://localhost:5202`);
})
