import { Link, useActionData, useNavigation } from '@remix-run/react';
import { type ActionArgs, json } from "@remix-run/node"

import logo from '../images/logo.svg'
import { Input, Message } from '~/components';
import { z } from 'zod';
import { makeDomainFunction } from 'domain-functions';
import { performMutation } from 'remix-forms';
import { Form } from '~/form';
import { getUserByEmail } from '~/features/Auth';
import { EMAIL_TEMPLATE, sendEmail } from '~/features/Email';

/**
 * Form validation schema
 */
const schema = z.object({
  cleanMessage: z.string(),
  email: z.string()
    .min(1, { message: 'Informe o email'})
    .email({ message: 'Informe um e-mail válido'})
    .trim(),
})

/**
 * Send request password mutation
 */
const sendRequestPasswordMutation = makeDomainFunction(schema)(async (data) => { 
  const { cleanMessage, email } = data
  
  if (cleanMessage) {
    return { ...data, name: '' }
  }

  const user = await getUserByEmail(email)

  return {
    ...data,
    name: user.name
  }
})

/**
 * Send Change Password E-mail
 * @param name 
 * @param email 
 * @returns Success/Error view object
 */
const sendChangePasswordEmail = async (name: string, email: string) => {
  try {
    await sendEmail({ name, email, template: EMAIL_TEMPLATE.FORGOT_PASSWORD })
    
    return json({
      error: '',
      success: 'E-mail com link para troca de senha enviada com sucesso',
      data: {
        email
      }
    })
  } catch(error) {
    return json({
      error: 'Erro no envio do e-mail de solicitação de senha',
      success: '',
      data: {
        email
      }
    })
  }
}

/**
 * Action
 * @param param0 
 * @returns 
 */
export async function action({ request }: ActionArgs) {
  const result = await performMutation({
    request,
    schema,
    mutation: sendRequestPasswordMutation
  })

  if (!result.success) {
    const globalErrors = result.errors._global ?? ['Erro ao solicitar a nova senha. Tente novamente mais tarde.']    
    const { email } = result.values

    return json({
      error: globalErrors[0],
      success: '',
      data: {
        email,
      }
    })
  }

  const { cleanMessage, email, name } = result.data
  
  if (cleanMessage) {
    return json({
      error: '',
      success: '',
      data: {
        email
      }
    })
  }

  return sendChangePasswordEmail(name, email)
};

export default function () {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()

  return (
    <main className="flex justify-center items-center h-screen relative">

      <Message 
        autoClose={2000}
        success={actionData?.success}
        error={actionData?.error}
        fields={[
          {name: 'email', value: actionData?.data.email}
        ]}
      />

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
          Esqueceu a senha?
        </h1>

        {/* Formulário */}
        <Form schema={schema}  className="grid gap-4">
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

              <button 
                disabled={navigation.state === 'submitting' || navigation.state === 'loading'}
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
                  disabled:opacity-50
                  disabled:pointer-events-none
                  focus:border-blue-700
                  transition-all
                  duration-300
                "
              >
                {navigation.state === 'submitting' ? 'Enviando...' : 'Solicitar nova senha'}
              </button>
            </>
          )}

        </Form>

        {/* Link de esqueci minha senha */}
        <Link 
          to="/login"
          className="
            justify-self-center
            text-blue-500
            hover:underline
          "
        >
          Voltar para Login
        </Link>

      </div>
    </main>
  );
}