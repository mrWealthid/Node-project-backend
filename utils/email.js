const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(',')[0];
    this.url = url;
    this.from = `Wealth <${process.env.EMAIL_FROM}>`;
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
};
