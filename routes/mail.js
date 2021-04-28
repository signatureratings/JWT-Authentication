if (process.env.USERNAME == 'balus') {
  require('dotenv').config({ path: '../.env' })
}
const express = require('express')
const mailRouter = express.Router()
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const userDetails = require('../models/registration')
const jwt = require('jsonwebtoken')


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

async function mailsend(email, username, link) {
  try {
    email = email
    subject = 'Welcome to our community'
    html = `<h1>${username}</h1>
    <h4>To confirm your email please click the link below and verify</h4>
    <a href="${link}">Link to verify tour email</a>`
    await sendmail(email, subject, html)
    console.log('mail is sent')
  } catch (err) {
    console.log('error occured')
  }
}

mailRouter.get('/', async (req, res) => {
  try {
    const token = req.query.token
    if (token) {
      jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
        if (err) {
          return res.status(405).json({ message: 'invalid token' })
        }
        const email = data.user
        userDetails.findOne({ email: email }).then((temp) => {
          if (temp && temp.emailVerified) {
            return res
              .status(200)
              .json({ message: 'Email is verified already' })
          }
          temp.emailVerified = true
          temp.save()
          console.log('email is verified')
          return res.status(200).json({
            message: 'Your email is verified you can now go to home page',
          })
        })
      })
    }
    else{
    return res.status(403).json({ message: 'No data is provided' })
    }
  } catch (err) {
    console.log(err)
    return res.status(401).json({ message: 'an error occured' })
  }
})

async function checkvaliduser(email) {
  try {
    const temp = await userDetails.findOne({ email: email })
    if (temp.emailVerified) {
      console.log('already verified')
      return 0
    } else {
      console.log('not verified but verifiying')
      temp.emailVerified = true
      await temp.save()
      console.log('verified ')
      return 1
    }
  } catch (err) {
    console.log(err, 'occured')
    return -1
  }
}

/**
 * const token = req.query.token
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
      if (err) {
        return res.status(403).json({ message: 'Wrong details' })
      }
      try {
        console.log('entered try block')
      } catch (err) {
        console.log('entered catch block')
        console.log(err)
        return res.status(500).json({ message: 'error occured' })
      }
    })
  }
  return res.status(401).json({ message: 'You are making a mistake' })
 */
module.exports = { mailRouter, mailsend }
