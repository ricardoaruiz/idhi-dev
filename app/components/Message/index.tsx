import { Form } from '@remix-run/react'
import React, { useEffect, useRef } from 'react'

type Field = {
  name: string
  value: string | null | undefined
}

type MessageProps = {
  error?: string
  success?: string
  fields?: Field[]
  autoClose?: number
}

export const Message = ({ success, error, fields, autoClose }: MessageProps) => {
  const clearMessageButtonRef = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (autoClose && (success || error)) {
        clearMessageButtonRef.current?.click()
      }
    }, autoClose);

    return () => clearTimeout(handler)
  }, [success, error, autoClose])

  return (
    <Form method="POST">
      <div 
        className={`
          flex
          justify-between
          items-baseline
          fixed
          w-full
          left-0
          p-2
          md:p-3
          border-t-2
          font-bold
          text-md
          md:text-lg
          text-center
          transition-all
          duration-300
          ease-in-out

          ${success || error ? 'bottom-0 visible opacity-100' : '-bottom-10 invisible opacity-0'}
          ${success && 'bg-green-300 border-green-600 text-green-800'}
          ${error && 'bg-red-300 border-red-600 text-red-800'}
        `}
      >
        <span className="inline-block text-center">{success || error}</span>

        <button 
          ref={clearMessageButtonRef} 
          name="cleanMessage" 
          value="true"
          className={`
            self-start
            flex
            justify-center
            items-center
            w-6
            h-6
            p-1
            rounded-full
            ${success && 'hover:bg-green-900 hover:text-green-300'}
            ${error && 'hover:bg-red-900 hover:text-red-300'}
          `}
        >
          X
        </button>
        
        {fields?.map(({ name, value }) => (
          <input key={name} type="hidden" name={name} defaultValue={value || ''} />
        ))}
      </div>
    </Form>
  )
}
