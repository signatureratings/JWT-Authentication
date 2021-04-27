if (process.env.USERNAME == 'balus') {
  require('dotenv').config({ path: '../.env' })
}
const express = require('express')
const loginRouter = express.Router()
const jwt = require('jsonwebtoken')
const userDetails = require('../models/registration')
const bcrypt = require('bcrypt')

loginRouter.get('/', (req, res) => {
  if (req.cookies) {
    return res.status(200).redirect('/')
  }
  return res.status(200).render('login', { message: '' })
})

loginRouter.post('/', async (req, res) => {
  console.log('post method of login is called')
  if (req.body.email && req.body.password) {
    try {
      let check = await userDetails.find({ email: req.body.email })
      if (req.body.password == check[0].password) {
        const token = generateAccessToken(req.body.email)
        res.cookie('SID', token, { maxAge: 1000 * 60 * 60 })
        console.log('redirecting to main page')
        return res.status(200).redirect('/')
      } else {
        return res.status(403).render('login', {
          message: 'We cannot match your details in our database',
        })
      }
    } catch (err) {
      console.log(err)
      return res
        .status(501)
        .render('login', { message: 'An error occure in our server' })
    }
  }
  return res
    .status(401)
    .render('login', { message: 'no login data is provided' })
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

module.exports = loginRouter
