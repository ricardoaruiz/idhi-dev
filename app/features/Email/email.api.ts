import nodemailer from 'nodemailer'
import handlebars from 'nodemailer-express-handlebars'
import path from 'path'

import { googleAuth } from '~/google.server'

export enum EMAIL_TEMPLATE {
  FORGOT_PASSWORD = 'forgot-password'
}

/**
 * Create nodemailer transport object
 * @param googleAccessToken 
 * @returns 
 */
const createEmailTransporter = (googleAccessToken: string | undefined | null) => {
  const transporter = nodemailer.createTransport({
    //@ts-ignore
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GOOGLE_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: googleAccessToken
    },
  })

  const viewDir = path.join(__dirname, '..', '/app/features/Email/templates')
  console.info('=======viewDir============', viewDir)

  const options = {
    viewEngine : {
      extname: '.hbs',
      layoutsDir: viewDir,
      defaultLayout: ''
    },
    viewPath: viewDir,
    extName: '.hbs'
  };

  transporter.use('compile', handlebars(options))

  return transporter
}

/**
 * Create email options
 * @param email 
 * @returns 
 */
const createEmailOptions = (email: string, name: string, template: EMAIL_TEMPLATE) => {
  return {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Teste Email',
    template,
    context: {
      name
    }
  }
}

type SendEmailParams = {
  name: string
  email: string
  template: EMAIL_TEMPLATE
}

/**
 * Send an e-mail
 * @param email 
 * @returns 
 */
export const sendEmail = async ({ name, email, template }: SendEmailParams) => {

  const googleAuthResponse = await googleAuth()
  const transporter = createEmailTransporter(googleAuthResponse.token)
  return transporter.sendMail(createEmailOptions(email, name, template))
}