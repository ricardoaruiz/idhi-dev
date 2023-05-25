import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "react-router"
import { destroySession, getSession } from "~/session.server"

/**
 * 
 * @param param0 
 * @returns 
 */
export async function loader({ request }: LoaderArgs) {
  
  const session = await getSession(request.headers.get('Cookie'))
  
  return redirect('/login', {
    headers: {
      "Set-Cookie": await destroySession(session)
    }
  })
};