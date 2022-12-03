import * as IronSession from "iron-session"

declare module "iron-session" {
  interface IronSessionData {
    modalValues?:
      | {
          loggedIn: false
        }
      | {
          loggedIn: true
          email: string
        }
  }
}

export const settings: IronSession.IronSessionOptions = {
  cookieName: "myapp_cookiename",
  password: "complex_password_at_least_32_characters_long",
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
  ttl: 60 * 60 * 24 * 7, // 7 days
}
