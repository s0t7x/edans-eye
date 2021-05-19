const path = require("path");

const express = require("express");
const session = require("express-session");
const app = express();
const port = 8000;

const totp = require("totp-generator");

const sqlite3 = require('sqlite3');
let db = new sqlite3.Database('./data.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to database.');
});

db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS "screenshots" (id INTEGER PRIMARY KEY AUTOINCREMENT, url VARCHAR(64) NOT NULL, description VARCHAR(1024))`, 
        (err) => {
            if (err) {
                console.error(err.message);
            }
    });
});

const auth = (req, res, next) => {
    if(req.session.loggedIn){
        return next();
    } else {
        return res.redirect("/");
    }
};

app.use(
    express.static(__dirname + "/www/")
);

app.use(
    session(
        {
            secret: "g8(90ß34er564!",
            name: "edans-session", 
            saveUninitialized:false,
            resave:true
        }
    )
);

app.get("/store/:url/:desc", auth, (req, res) => {
    if(req.params.url){
        db.serialize(() => {
            db.get(
                `SELECT * FROM screenshots WHERE url = '` + req.params.url + `' LIMIT 1`, 
                (err, row) => {
                    if (err) {
                        console.error(err.message);
                        return res.sendStatus(500);
                    }
                    if(!row) {
                        db.run("INSERT INTO screenshots (url, description) VALUES ('"+req.params.url+"', '"+req.params.desc+"');",
                        (err) => {
                            if (err) {
                                console.error(err.message);
                                return res.sendStatus(500);
                            }
                        });
                    }
                    if(req.params.desc){
                        db.run("UPDATE screenshots SET description = '"+req.params.desc+"' WHERE url = '"+req.params.url+"'",
                        (err) => {
                            if (err) {
                                console.error(err.message);
                                return res.sendStatus(500);
                            }
                        });
                    }
            });
        });
        let backURL = req.header('Referer') || '/';
        return res.redirect(backURL);
    }
});

app.get("/fetch", (req, res) => {
    db.serialize(() => {
        db.all(
            `SELECT * FROM screenshots`, 
            (err, rows) => {
                if (err) {
                    console.error(err.message);
                }
                return res.json(rows);
        });
    });
});

app.get("/erase/:url", auth, (req, res) => {
    if(req.params.url){
        db.serialize(() => {
            db.run(
                `DELETE FROM screenshots WHERE url = '` + req.params.url + `'`, 
                (err) => {
                    if (err) {
                        console.error(err.message);
                        return res.sendStatus(500);
                    }
            });
        });
        let backURL = req.header('Referer') || '/';
        return res.redirect(backURL)
    }
});

app.get("/login/:clientToken", (req, res) => {
    let serverToken = totp("ZnJpc2NobWlsY2glMQ", { digits: 6 });
    if(serverToken === req.params.clientToken){
        req.session.loggedIn = true;
        return res.redirect("/manage");
    }
    req.session.destroy();
    res.redirect("/login");
})

app.get("/login", (req, res) => {
    return res.sendFile(__dirname + "/login.html");
})

app.get("/manage", auth, (req, res) => {
    return res.sendFile(__dirname + "/manage.html");
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get('*', function(req, res){
    res.redirect("/");
});

app.listen(port, () => {
  console.log(`Edans-Eye listening at http://localhost:${port}`)
});