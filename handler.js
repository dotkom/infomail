
const nodemailer = require('nodemailer')
const aws = require('aws-sdk');
const axios = require('axios');

let transporter = nodemailer.createTransport({
    SES: new aws.SES({
        apiVersion: '2010-12-01'
    })
});

const days = {
  0: 'Mandag',
  1: 'Tirsdag',
  2: 'Onsdag',
  3: 'Torsdag',
  4: 'Fredag',
  5: 'Lørdag',
  6: 'Søndag'
}

const months = {
  0: 'januar',
  1: 'februar',
  2: 'mars',
  3: 'april',
  4: 'mai',
  5: 'juni',
  6: 'juli',
  7: 'august',
  8: 'september',
  9: 'oktober',
  10: 'november',
  11: 'desember'
}

function formatDate(date) {
    var d = date,
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function sendMail(from_address, to_address, text, html){
    const date = new Date()
    const data = {
        from: from_address,
        to: to_address,
        subject: '[Infomail] '+formatDate(date),
        text: text,
        html: html,
    }

    transporter.sendMail(data, (err, info) => {
        console.log(info.envelope);
        console.log(info.messageId);
    });
 }

 // https://online.ntnu.no/api/v1/events/?format=json&ordering=-is_today&event_start__gte=2019-04-10&event_end__lte=2019-04-24
 Date.prototype.addDays = function(days) {
     var date = new Date(this.valueOf());
     date.setDate(date.getDate() + days);
     return date;
 }




 async function getEvents(){
   const start = formatDate(new Date())
   const end = formatDate(new Date().addDays(21))

   const response = await axios.get('https://online.ntnu.no/api/v1/events/?format=json&ordering=event_start&event_start__gte='+start+'&event_end__lte='+end+'&page_size=20')

   return response.data.results
 }

 function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function dateToText(date){
  let day = date.getDay() ? date.getDay() : 7
  let number = date.getDate()
  let month = date.getMonth()
  return capitalize(days[day+''])+' '+number+'. '+months[month+'']

}

function formatHTML(object) {
  let ingress = object.ingress
  let title = object.title
  let url = 'https://online.ntnu.no'+object.absolute_url
  let date = new Date(object.event_start)

  return '<ul><li>'+
  '<b>' + dateToText(date)+': '+title+'</b><br/>' +
  ingress +
  '<br/><a href="'+url+'">'+url+'</a>' +
  '</ul></li>'


}

function formatText(object) {
  let ingress = object.ingress
  let title = object.title
  let url = 'https://online.ntnu.no'+object.absolute_url
  let date = new Date(object.event_start)

  return dateToText(date)+ ': '+title+'\n'+
  ingress+'\n'+
  url+'\n\n'
}


exports.myHandler = async function(event, context, callback) {
  const data = await getEvents()
  let text = 'Her er ukens infomail\n\n';
  let html = '<div> Her er ukens infomail <br/><br/>';

  const textBody = data.reduce((acc, c) => acc + formatText(c), text)
  let htmlBody = data.reduce((acc, c) => acc + formatHTML(c), html)
  htmlBody+='</div>'


    sendMail(event.from_email, event.to_email, textBody, htmlBody)
    callback(null, "some success message");
}

/*async function test() {
  const data = await getEvents()
  let text = 'Her er ukens infomail\n\n';
  let html = '<div> Her er ukens infomail <br/><br/>';

  const textBody = data.reduce((acc, c) => acc + formatText(c), text)
  let htmlBody = data.reduce((acc, c) => acc + formatHTML(c), html)
  htmlBody+='</div>'
}

test()*/
