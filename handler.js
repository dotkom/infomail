
const nodemailer = require('nodemailer')
const aws = require('aws-sdk');
const axios = require('axios');

let transporter = nodemailer.createTransport({
    SES: new aws.SES({
        apiVersion: '2010-12-01'
    })
});


function sendMail(from_address, to_address, text, html){
    const data = {
        from: from_address,
        to: to_address,
        cc: cc_addresses,
        subject: 'Infomail',
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
      data.push(response.results)
      next = response.next
    })
    .catch()

    while (next) {
      let response = await axios.get(next)
      data.push(response.results)
      next = response.next
    }

    return data

 }

 function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatDate(date){
  const options = { weekday: 'long', year: 'numeric', month: 'long'};
  const array = date.toLocaleDateString('nb-NO', options).split(' ');
  return capitalize(array[0])+' '+array[1]+' '+capitalize(array[2])

}

function formatHTML(object) {
  let ingress = object.short_ingress
  let title = object.title
  let url = 'https://online.ntnu.no/'+object.absolute_url
  let date = new Date(object.event_start).to

  return '<ul><li>'+
  '<b>' + formatDate(date)+': '+title+'</b>' +
  ingress +
  '<a href="'+url+'">'+url+'</a>' +
  '</ul></li>'


}

function formatText(object) {
  let ingress = object.short_ingress
  let title = object.title
  let url = 'https://online.ntnu.no/'+object.absolute_url
  let date = new Date(object.event_start)

  return formatDate(date)+ ': '+title+'\n'+
  ingress+'\n'+
  link+'\n\n'
}


exports.myHandler = async function(event, context, callback) {
    const data = await getEvents()
    let text = 'Her er ukens infomail\n\n';
    let html = '<div> Her er ukens infomail <br/><br/>';

    data.forEach(function(item, index) {
      text+= formatText(item)
      html+= (formatHTML(item))
    })

    html+='</div>'


    sendMail(process.env.from_address, process.env.to_address, text, html)
    callback(null, "some success message");
}
