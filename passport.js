const passport = require("passport");
const LocalStrategy = require("passport-local");

module.exports = function (app) {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    // await User.findById(id, function (err, user) {
    //   done(err, user);
    // });

    const user = await where({ id: id });
    if (user === null) {
      throw new Error("User not found");
    }
    return { ...user };
    // const user = await where({ id: id });
    // if (user === null) {
    //   throw new Error("User not found");
    // }
    // return { ...user };

    async function where(condition) {
      return await knex("users")
        .where(condition)
        .then((results) => {
          if (results.length === 0) {
            return null;
          }
          return results[0];
        });
    }
  });
  // router.post('/login', passport.authenticate('local', {
  //   app.post('/login', passport.authenticate('local', {
  //     successRedirect: '/items',
  //     failureRedirect: '/login',
  //     failureFlash: true,
  //   }
  // ));

  passport.use(
    new LocalStrategy(
      {
        usernameField: "user_name",
        passwordField: "password",
      },
      function (user_name, password, done) {
        knex("users")
          .where({
            name: user_name,
          })
          .select("*")
          .then(async function (results) {
            if (results.length === 0) {
              return done(null, false, { message: "Invalid User" });
              // } else if (await bcrypt.compare(password, results[0].password)) {
            } else {
              //   return done(null, results[0]);
              return done(null, results[0]);
            }
            // } else {
            //   return done(null, false, {message: "Invalid User"});
            // }
          })
          .catch(function (err) {
            console.error(err);
            return done(null, false, { message: err.toString() });
          });
      }
    )
  );
  app.use(passport.session());
};
