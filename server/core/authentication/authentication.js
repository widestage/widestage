module.exports = function (app) {

    console.log('Module auth loaded');
    addModulesUsedList('auth');

        const passport = require('passport')

        const cookieParser = require('cookie-parser');
        const passportSocketIo = require('passport.socketio');
        const session = require('express-session');

        const cookieSession = require('cookie-session');
        const flash = require('connect-flash');
        //const RedisStore = require('connect-redis')(session)

        //global.rights = require('./libs/rights')
        //global.rights.init()

        const SessionMongoStore = require('connect-mongo')(session);
        let sessionStore = new SessionMongoStore({
          mongooseConnection: connection,
          touchAfter: 15
        })


/*
        if (config.db_type == 'mongoDB')
        {
        const SessionMongoStore = require('connect-mongo')(session);
        let sessionStore = new SessionMongoStore({
          mongooseConnection: connection,
          touchAfter: 15
        })
      }

      if (config.db_type == 'NeDB')
      {
        const SessionNEDBStore = require('connect-nedb-session')(session);
        let sessionStore = new NedbStore({ filename: __dirname+'/../../'+config.nedb_path+'/'+global.env+'/session.db' });
      }
*/
        var memoryStore = new session.MemoryStore();

        //app.use(cookieParser())

        //app.use(cookieSession({key:config.appName, secret:"HEWÑÑasdfwejñlkjqwernnkkk13134134wer"+config.appName, httpOnly: true, secure: false, cookie: {maxAge: 60 * 60 * 1000}}));
        //app.use(session());

         app.use(session({
          name: config.appName,
          store: sessionStore,
          //store: new RedisStore({maxAge: 60 * 60 * 1000}),
          secret: config.sessionSecret,
          resave: false,
          saveUninitialized: true,
            cookie: { secure: false }
        }))

        app.use(passport.initialize());
        app.use(passport.session());
        app.use(cookieParser());
        app.use(passport.authenticate('remember-me'));

        app.use(flash());

        global.permissions = [];
        global.objectGrants = [];

    require('./model.js');
    require('./routes.js')(app,passport);
    require('./controller.js')(passport);

}
