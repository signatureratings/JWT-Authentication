if (process.env.USERNAME == 'balus') {
  require('dotenv').config({ path: '../.env' })
}
const express = require('express')
const mailRouter = express.Router()
const nodemailer = require('nodemailer')
const { google } = require('googleapis')

/* const CLIENT_ID =
  '206406925094-0bn4gfbkpk2a1d36crhtepeeligfsu7p.apps.googleusercontent.com'
const CLIENT_SECRET = '1R_30VvF1iT81C5YVZycMhqE'
const REDIRECT_URL = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN =
  '1//04lG3x-2ifCqDCgYIARAAGAQSNwF-L9IrjqT1YbMkPfvYMDzYet6R0vA0h0PleQfKS6a1WulyX5s_X9Lk1xskAnNTWi3BX6dTp88'
  */

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
)

oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })

async function sendmail(sendermail, sub, html) {
  try {
    const accessToken = await oauth2Client.getAccessToken()
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'oAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    })
    const options = {
      from: `Sairam <${process.env.EMAIL_USER}>`,
      to: sendermail,
      subject: sub || 'Thanks for joining into our community',
      text: sub || 'Hello from Sairambalu',
      html: html || '<h1>Hello from Sairambalu</h1>',
    }

    const result = await transport.sendMail(options)
    return result
  } catch (err) {
    return err
  }
}

async function mailsend(email, username) {
  try {
    email = email
    subject = 'Welcome to our community'
    html = `<h1>${username}</h1>
    <h4>To confirm your email please click the link below and verify</h4>
    <a href="www.instagram.com">Link</a>`
    await sendmail(email, subject, html)
    console.log('mail is sent')
  } catch (err) {
    console.log('error occured')
  }
}

module.exports = { mailRouter, mailsend }
