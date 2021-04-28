if (process.env.USERNAME == 'balus') {
  require('dotenv').config({ path: '../.env' })
}
const express = require('express')
const registrationRouter = express.Router()
const jwt = require('jsonwebtoken')
const userDetails = require('../models/registration')
const bcrypt = require('bcrypt')
const { mailsend } = require('./mail')

registrationRouter.get('/', (req, res) => {
  console.log('registrationrouter will executed get method')
  if (req.header.cookie) {
    return res.status(200).render('index')
  }
  return res.status(200).render('register', { message: '' })
})

registrationRouter.post('/', async (req, res) => {
  if (req.body.email && req.body.username && req.body.password) {
    /*var isHashed = true,
      hashedpassword
    bcrypt.hash(
      req.body.password,
      process.env.bcryptRounds,
      function (err, hash) {
        if (err) isHashed = false
        hashedpassword = hash
      }

      //it is an async function so the value becomes undefined
    )*/
    const userdetails = new userDetails({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordHashed: false,
      registeredAt: new Date(),
      lastSeen: new Date(),
    })
    let re = new RegExp(process.env.regexExpression)
    if (re.test(`${req.body.email}`)) {
      console.log('email valid')
    } else {
      console.log('not matched')
    }
    try {
      let check = await userDetails.find({ email: req.body.email })
      if (check.length) {
        return res.status(202).render('register', {
          message: 'There is already an email with this account',
        })
      }
      const token = generateAccessToken(req.body.email)
      const url = process.env.URL || 'http://localhost:5000/'
      link = `${url}verifyemail?token=${token}`
      let result = await userdetails.save()
      if (result) {
        await mailsend(req.body.email, req.body.username, link)
        res.cookie('SID', token, { maxAge: 1000 * 60 * 60 })
        return res
          .status(200)
          .render('verifyemail', { name: req.body.username })
      }
    } catch (err) {
      console.log(err)
      return res
        .status(501)
        .render('register', { message: 'Error in creating the account' })
    }
  }
  return res.status(401).render('register', { message: 'Send details u idiot' })
})

function generateAccessToken(user) {
  return jwt.sign(
    {
      user: user,
      exp: new Date().getTime() + 60 * 60 * 1000,
    },
    process.env.SECRET_KEY
  )
}

module.exports = registrationRouter
