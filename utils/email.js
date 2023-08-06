const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(',')[0];
    this.url = url;
    this.from = `support@em4491.wealthtech.website`;
  }

  handleCreateTransport() {
    if (process.env.NODE_ENV === 'production') {
      //SEnd Grid
      return nodemailer.createTransport({
        service:'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
        pass:process.env.SENDGRID_PASSWORD
        }
      })

      //Couldn't implement Send Grid because my account wasn't created! Try to Implement later when account is approved!
    }

    return nodemailer.createTransport({
      // service: 'Gmail',
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //Send the actual emails
    //1) Render HTML, based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      { firstName: this.firstName, url: this.url, subject }
    );
    //2)- Define emails options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.htmlToText(html),
      // html:
    };

    //3 Create a transport and send emails
    await this.handleCreateTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }



sendMyMail() {
const msg = {
  to: 'mygee@mailsac.com', // Change to your recipient
  from: 'test@example.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })
}
};
