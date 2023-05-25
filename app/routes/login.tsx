import { type ActionArgs, json } from "@remix-run/node"
import { Link, useActionData } from "@remix-run/react"

import logo from '../images/logo.svg'
import { Input, Message } from "~/components"
import { z } from "zod"
import { makeDomainFunction } from "domain-functions"
import { Form } from "~/form"
import { performMutation } from "remix-forms"
import { login } from "~/features/Auth"
import { createSession } from "~/session.server"

/**
 * Form validation schema
 */
const schema = z.object({
  cleanMessage: z.string(),
  email: z.string().min(1, { message: 'Informe o email'}).email({ message: 'Informe um e-mail válido'}).trim(),
  password: z.string().min(1, { message: 'Informe a senha'}).trim()
})

/**
 * Login function, receives data from form and validate credentials
 */
const loginMutation = makeDomainFunction(schema)(async (data) => { 
  const { cleanMessage, email, password } = data
  
  if (cleanMessage) {
    return { ...data, id: null }
  }

  // TODO: Fazer a validação do login nesse ponto (acessar o banco de dados ou uma API)
  const user = await login({
    email,
    password
  })
  
  return {
    ...data,
    id: user.id
  }
})

/**
 * Action Function
 * @param param0 
 * @returns data object or redirect
 */
export async function action({ request }: ActionArgs) {
  const result = await performMutation({
    request,
    schema,
    mutation: loginMutation
  })

  if (!result.success) {
    const globalErrors = result.errors._global ?? ['Erro ao efetuar o login. Tente novamente mais tarde.']    
    const { email, password } = result.values

    return json({
      error: globalErrors[0],
      success: '',
      data: {
        email,
        password
      }
    })
  }
  
  const { cleanMessage, email, password } = result.data

  if (cleanMessage) {
    return json({
      error: '',
      success: '',
      data: {
        email,
        password
      }
    })
  }

  // Create new session
  return createSession(request, String(result.data.id))
};

/**
 * View
 * @returns JXS
 */
export default function Login() {
  const actionData = useActionData<typeof action>()

  return (
    <main className="flex justify-center items-center h-screen relative">

      <Message 
        autoClose={2000}
        success={actionData?.success}
        error={actionData?.error}
        fields={[
          {name: 'email', value: actionData?.data.email},
          {name: 'password', value: actionData?.data.password}
        ]}
      />

      {/* Container com todos os elementos menos a mensagem de erro */}
      <div className="grid gap-6 px-4 w-full md:w-[400px]">
        
        {/* Logotipo */}
        <img 
          src={logo} 
          alt="IHDI Logo" 
          className="
            w-40
            md:w-auto
            justify-self-center
          "
        />

        {/* Título */}
        <h1 
          className="
            justify-self-center
            text-3xl
            font-bold
            text-center
          "
        >
          Processamento de Pagamentos
        </h1>

        {/* Formulário */}
        <Form schema={schema} className="grid gap-4">
          {({ Field, register }) => (
            <>
              <Field name="email">
                {({ errors }) => (
                  <Input 
                    label="E-mail"
                    type="email"
                    error={errors && errors[0]}
                    { ...register('email') }
                  />
                )}
              </Field>

              <Field name="password">
                {({ errors }) => (
                  <Input 
                    label="Senha"
                    type="password"
                    error={errors && errors[0]}
                    { ...register('password') }
                  />
                )}
              </Field>

              <button 
                className="
                  px-4
                  py-2
                  outline-none
                  border-2
                  border-blue-500
                  rounded
                  text-white
                  font-bold
                  text-lg
                  bg-blue-500
                  hover:bg-blue-600
                  active:bg-blue-700
                  focus:border-blue-700
                  disabled:opacity-50
                  transition-all
                  duration-300
                "
              >
                Entrar
              </button>
            </>
          )}
        </Form>

        {/* Link de esqueci minha senha */}
        <Link 
          to="/esqueci-senha"
          className="
            justify-self-center
            text-blue-500
            hover:underline
          "
        >
          Esqueci minha senha
        </Link>        
      </div>
    </main>
  )
}