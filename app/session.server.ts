// Documentation
// https://remix.run/docs/en/1.14.3/utils/sessions

import { createCookieSessionStorage, redirect } from "@remix-run/node";

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const COOKIE = "Cookie"

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      cookie: {
        name: "__session",
        httpOnly: true,
        maxAge: 60,
        path: "/",
        sameSite: "lax",
        secrets: [process.env.SESSION_SECRET],
        secure: true,
      },
    }
  );

/**
 * Create a new session with user id
 * https://remix.run/docs/en/1.14.3/utils/sessions#:~:text=A%20login%20form%20might%20look%20something%20like%20this%3A
 * @param request 
 * @param userId 
 * @returns 
 */
const createSession = async (request: Request, userId: string) => {

  // Create session and put userId on it
  const session = await getSession(request.headers.get(COOKIE))
  session.set('userId', userId)

  // Redirect to logged home with cookie on header
  return redirect('/', {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  })
}

/**
 * Get User id from session
 * https://remix.run/docs/en/1.14.3/utils/sessions#session-gotchas:~:text=A%20login%20form%20might%20look%20something%20like%20this%3A
 * @param request 
 * @returns 
 */
const getLoggedUser = async (request: Request) => {
  const session = await getSession(request.headers.get(COOKIE))

  if (!session.has('userId')) {
    throw redirect('/login')
  }

  return session.get('userId')

}

export { 
  getSession, 
  commitSession, 
  createSession, 
  getLoggedUser, 
  destroySession 
};