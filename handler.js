
let nodemailer = require('nodemailer')
let aws = require('aws-sdk');

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

 function makeStringBoldHtml(text){
     return "<b>" + text + "</b>";
 }


exports.myHandler = function(event, context, callback) {   
    
    sendMail(event.from_address, event.to_address, event.cc_addresses)
    callback(null, "some success message");
}