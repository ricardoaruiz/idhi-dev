import { db } from "~/db"
import bcrypt from 'bcryptjs'

type LoginParams = {
  email: string
  password: string
}

export async function login(params: LoginParams) {
  const user = await db.user.findUnique({
    where: {
      email: params.email
    }
  })

  if (!user || !bcrypt.compareSync(params.password, user.password)) {
    throw 'E-mail ou senha inválidos'
  }

  return user
}

export async function getUserByEmail(email: string) {
  const user = await db.user.findUnique({
    where: {
      email: email
    }
  })

  if (!user) {
    throw 'E-mail não cadastrado'
  }

  return user
}