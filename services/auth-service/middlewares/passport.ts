import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findOrCreateGoogleUser } from "../services/authServices.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
        },
        async(_accessToken, _refreshToken, profile, done)=> {
        try {
            const result = await findOrCreateGoogleUser(profile);
            done(null, result);
        } catch(error) {
            done(error, undefined);
        }
    }
    )
)

export default passport