const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

module.exports = function (passport) {
  // GOOGLE STRATEGY
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({
            provider: 'google',
            providerId: profile.id
          });

          if (existingUser) return done(null, existingUser);

          const newUser = await User.create({
            provider: 'google',
            providerId: profile.id,
            displayName: profile.displayName,
            email: profile.emails && profile.emails[0]?.value
          });

          done(null, newUser);
        } catch (err) {
          console.error(err);
          done(err, null);
        }
      }
    )
  );

  // GITHUB STRATEGY
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({
            provider: 'github',
            providerId: profile.id
          });

          if (existingUser) return done(null, existingUser);

          const newUser = await User.create({
            provider: 'github',
            providerId: profile.id,
            displayName: profile.displayName || profile.username,
            email:
              profile.emails && profile.emails.length
                ? profile.emails[0].value
                : null
          });

          done(null, newUser);
        } catch (err) {
          console.error(err);
          done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
