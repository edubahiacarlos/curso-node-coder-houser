const passport = require("passport");
const userService = require("../model/user");
const GitHubStrategy = require("passport-github2");
const local = require("passport-local");
const { createHash, isValid } = require("../utils.js");
const LocalStrategy = local.Strategy;

const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        const { first_name, last_name, email } = req.body;
        try {
          let user = await userService.findOne({ email: username });
          if (user) {
            console.log("O usuário já existe");
            return done(null, false);
          }
          const novoUsuario = {
            first_name,
            last_name,
            email,
            password: createHash(password),
          };
          let result = await userService.create(novoUsuario);
          console.log("Usuario criado com sucesso!", result);
          return done(null, result);
        } catch (error) {
          console.log("Erro ao registrar o usuário: ", error);
          return done(`Ocorreu uma falha ao registrar o usuário ${error}`);
        }
      }
    )
  );
  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: "Iv23limMvDHzgaSjgcrF",
        clientSecret: "8979d7844203dfb1bc7921bffa0b3983de6e2713",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(profile);
          const email = profile._json.email || "default email";
          let user = await userService.findOne({ email: email });
          if (!user) {
            let newUser = {
              first_name: profile._json.name || "User",
              last_name: "last name",
              email: email,
              password: "defaultPassword",
            };
            let result = await userService.create(newUser);
            done(null, result);
          } else {
            done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    let user = await userService.findById(id);
    done(null, user);
  });

  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          const user = await userService.findOne({ email: username });
          if (!user) {
            console.log("O usuário não existe");
            return done(null, false);
          }
          if (!isValid(user, password)) {
            console.log("Senha inválida");
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

module.exports = initializePassport;
