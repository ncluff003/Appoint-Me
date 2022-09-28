////////////////////////////////////////////
//  Core Modules

////////////////////////////////////////////
//  Third Party Modules;
const nodemailer = require(`nodemailer`);
const pug = require(`pug`);
const htmlToText = require(`html-to-text`);

////////////////////////////////////////////
//  Third Party Module Instances

////////////////////////////////////////////
//  Third Party Config Files

////////////////////////////////////////////
//  Third Party Middleware

////////////////////////////////////////////
//  My Middleware

////////////////////////////////////////////
//  Routing Middleward

////////////////////////////////////////////
//  My Modules
const Calendar = require(`./Calendar`);
////////////////////////////////////////////
//  Email Model

module.exports = class sendEmail {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstname;
    this.lastName = user.lastname;
    this.myFirstName = `Nathan`;
    this.myLastName = `Cluff`;
    this.from = `Nathan Cluff <${process.env.NAMECHEAP_EMAIL}>`;
    this.startTime = user.startTime;
    this.endTime = user.endTime;
    this.phoneNumber = user.phoneNumber;
    this.email = user.email;
    this.communicationPreference = user.communicationPreference;
    this.date = user.date;
  }
  // Create Transport
  makeTransport() {
    if (process.env.NODE_ENV === `production`) {
      return nodemailer.createTransport({
        host: 'mail.privateemail.com',
        port: process.env.SECURE_PORT,
        secure: true,
        auth: {
          user: process.env.NAMECHEAP_EMAIL,
          pass: process.env.NAMECHEAP_PASSWORD,
        },
        logger: true,
      });
    }
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });
  }

  async _send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../Views/Emails/${template}.pug`, {
      // * EVENTUALLY, THE FROM EMAIL WILL BE MADE INTO A BUSINESS OR ADMIN ONE RATHER THAN MY PERSONAL ONE.
      from: this.from,
      to: this.to,
      firstname: this.firstName,
      lastname: this.lastName,
      myFirstName: this.myFirstName,
      myLastName: this.myLastName,
      subject: subject,
      startTime: this.startTime,
      endTime: this.endTime,
      phoneNumber: this.phoneNumber,
      email: this.email,
      communicationPreference: this.communicationPreference,

      greeting: Calendar.getGreeting(),
      hour: Calendar.getHour(),
      minutes: Calendar.getMinutes(),
      timeOfDay: Calendar.getTimeOfDay(),
      day: Calendar.getDay(),
      weekday: Calendar.getWeekday(),
      month: Calendar.getMonth(),
      year: Calendar.getYear(),
      longDate: Calendar.getLongDate(this.date),
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText.fromString(html),
      attachments: [
        {
          filename: 'Appoint-Me-Logo.jpg',
          contentType: 'image/jpeg',
          path: __dirname + `/../../Public/Appoint-Me-Logo.png`,
          cid: 'company-logo',
        },
      ],
    };

    await this.makeTransport().sendMail(mailOptions);
  }

  // Define The Email Options

  // * SEND APPOINTMENT ASK
  // * Working on the details still of this email.
  async sendAppointmentRequest() {
    await this._send(`appointment-request`, `Meeting Request`);
  }

  async sendWelcome() {
    await this._send('welcome', `Welcome To Royal King Richard's Family!`);
  }

  async sendResetPassword() {
    await this._send(`resetPasswordEmail`, `Your Requested Password Reset Token (Valid For Only 15 Minutes)`);
  }

  // * Send Associate Email
  async sendAssociateInvite(options) {
    await this._sendInvite('inviteUser', `You have been invited!`, options);
  }
  // * Send Admin Email
  async sendAdminInvite(options) {
    await this._sendInvite('inviteUser', `You have been invited!`, options);
  }
  // Send Email
};
