
const nodemailer = require('nodemailer')
const aws = require('aws-sdk');
const axios = require('axios');

let transporter = nodemailer.createTransport({
    SES: new aws.SES({
        apiVersion: '2010-12-01'
    })
});


function sendMail(from_address, to_address, cc_addresses){
    console.log('TO: ' + to_address + ', FROM: ' + from_address);
    const data = {
        from: from_address,
        to: to_address,
        cc: cc_addresses,
        subject: 'Infomail',
        text: 'Infomail',
    }

    transporter.sendMail(data, (err, info) => {
        console.log(info.envelope);
        console.log(info.messageId);
    });
 }

 // https://online.ntnu.no/api/v1/events/?format=json&ordering=-is_today&event_start__gte=2019-04-10&event_end__lte=2019-04-24

 function formatDate(date) {
     var d = new Date(date),
         month = '' + (d.getMonth() + 1),
         day = '' + d.getDate(),
         year = d.getFullYear();

     if (month.length < 2) month = '0' + month;
     if (day.length < 2) day = '0' + day;

     return [year, month, day].join('-');
 }


 async function getEvents(){
   const start = formatDate(new Date())
   const end = formatDate(new Date().addDays(15))
   let data = []
   let next = null

   axios.get('https://online.ntnu.no/api/v1/events/?ordering=-is_today&event_start__gte='+start+'&event_end__lte='+end)
    .then(response => {
      data.push(response.data)
      next = response.next
    })
    .catch()

    while (next) {
      let response = await axios.get(next)
      data.push(response.data)
      next = response.next
    }

    return data

 }


exports.myHandler = function(event, context, callback) {

    sendMail()
    callback(null, "some success message");
}
