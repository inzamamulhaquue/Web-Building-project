const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const _ = require('underscore');
const moment = require('moment');
sgMail.setApiKey(process.env.SENDGRID_KEY);

const {SUPPORT_MAIL, EMAIL_PAYLOAD_NAME, EMAIL_PAYLOAD_EMAIL} = process.env;
const getCurrentYear = moment().format('YYYY'); 

/**
 * Send email through sendgrid
 * @param {String} template
 * @param {String} to
 * @param {Object} payload
 */
const Email = (logger, template, to, payload, ccList = null, toList = null) => {
  return new Promise((resolve, reject) => {
    payload = {...payload,supportEmail:SUPPORT_MAIL,getCurrentYear,companyName:EMAIL_PAYLOAD_NAME}
    let personalizationsData = { to: [{ email: to }] };
    
    if (!_.isEmpty(payload.cc)) {
      personalizationsData = { ...personalizationsData, cc: [ {email: payload.cc }] };
    }

    if (!_.isEmpty(ccList)) {
      personalizationsData = { ...personalizationsData, cc: ccList }
    }

    if (!_.isEmpty(payload.bcc)) {
      personalizationsData = { ...personalizationsData, bcc: [ {email: payload.bcc }] };
    }
    
    if (!_.isEmpty(toList)) {
      personalizationsData = { to: toList };
    }

    const personalizations = [personalizationsData];
    
    let msg = {
      personalizations,
      from: {
        email: EMAIL_PAYLOAD_EMAIL,
        name: EMAIL_PAYLOAD_NAME,
      },
      templateId: template,
      dynamic_template_data: payload,
    };
    console.log('msg',msg)
    sgMail
      .send(msg)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        reject(err.message);
      });
  });
};

const EmailWithAttachment = (logger, template, to, payload, filePath) => {
  return new Promise((resolve, reject) => {
    payload = {...payload,supportEmail:SUPPORT_MAIL,getCurrentYear,companyName:EMAIL_PAYLOAD_NAME}
    console.log(fs.existsSync(filePath), 'file exists');
    const attachmentFile = fs.readFileSync(filePath).toString('base64');
    const { jobTitle, mimetype, filename } = payload;
    const msg = {
      personalizations: [
        {
          to: to,
          subject: `${jobTitle}`,
        },
      ],
      from: {
        email: EMAIL_PAYLOAD_EMAIL,
        name: EMAIL_PAYLOAD_NAME,
      },
      templateId: template,
      dynamic_template_data: payload,
      attachments: [
        {
          content: attachmentFile,
          filename: filename,
          type: mimetype,
          disposition: 'attachment',
        },
      ],
    };

    sgMail
      .send(msg)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.log(`Error in sendgrid`, JSON.stringify(err));
        reject(err.message);
      });
  });
};

module.exports = {
  Email,
  EmailWithAttachment,
};
