if (process.env.USERNAME == 'balus') {
  require('dotenv').config()
}
const path = require('path')
const express = require('express')
const app = express()
const expresslayouts = require('express-ejs-layouts')
const registrationRouter = require('./routes/registration')
const loginRouter = require('./routes/login')
const jwt = require('jsonwebtoken')
const userDetails = require('./models/registration')
const mongoose = require('mongoose')
const { mailRouter } = require('./routes/mail')

//connecting to the database
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

//Third party middleware
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.set('layout', path.join('layouts', 'layout'))

//built-in middleware
app.use(express.json())
app.use(expresslayouts)
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: false }))

//router-level middleware
app.get('/', validatetoken, async (req, res) => {
  if (req.user) {
    try {
      let check = await userDetails.findOne({ email: req.user })
      if (check && check.emailVerified) {
        return res.status(200).render('index', { name: check.username })
      } else {
        return res.status(401).redirect('/login')
      }
    } catch (err) {
      return res.status(501).json({ message: 'something wrong occured' })
    }
  }
  console.log('sorry redirecting')
  return res.status(202).redirect('/login')
})

app.use('/register', registrationRouter)
app.use('/login', loginRouter)
app.use('/verifyemail', mailRouter)

app.get('/logout', (req, res) => {
  console.log('logout executed')
  res.clearCookie('SID')
  res.redirect('/login')
})

//functions
function validatetoken(req, res, next) {
  let cookies = req.headers.cookie
  console.log('validate function is executed')
  if (cookies) {
    var values = {}
    let cookie = cookies.split(';')
    cookie.forEach((x) => {
      x = x.split('=')
      values[x[0]] = x[1]
    })

    console.log(values['SID'], 'cookie is available')

    if (values['SID']) {
      jwt.verify(values['SID'], process.env.SECRET_KEY, (err, data) => {
        if (err) {
          return res.status(403).redirect('/login')
        } else if (data.exp < new Date().getTime()) {
          res.clearCookie('SID')
          return res
            .status(201)
            .render('login', { message: 'Your session was expired' })
        } else {
          req.user = data.user
        }
      })
    } else {
      return res.status(202).redirect('/login')
    }
  } else {
    console.log('sorry redirecting to login ')
    return res.status(202).redirect('/login')
  }
  next()
}

//listening the server
app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`)
})
