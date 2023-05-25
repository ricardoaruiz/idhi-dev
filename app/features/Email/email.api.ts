import nodemailer from 'nodemailer'
import handlebars from 'nodemailer-express-handlebars'
import path from 'path'

import { googleAuth } from '~/google.server'

const TEMPLATES = {
  FORGOT_PASSWORD: (name: string) => `
    <html>
      <h1>Olá ${name},</h1>
      <p>Você está recebendo um link para a troca de sua senha</p>
      <p>Clique 
        <a href="www.google.com">aqui</a> 
        para ser redirecionado
      </p>
    </html>
  `
}

export enum EMAIL_TEMPLATE {
  FORGOT_PASSWORD = 'FORGOT_PASSWORD'
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
    html: TEMPLATES[template](name),
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