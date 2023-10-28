import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import ejs from "ejs";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";


const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}))

app.use(passport.initialize());
app.use(passport.session());

async function databaseConnection() {
    await mongoose.connect(process.env.DB_STRING).then(console.log("connected to blog database"));
}
databaseConnection();

const userSchema = new mongoose.Schema({
    name: String,
    profile_url: String,
    username: String,
    password: String,
    about: String,
    blogs: [{
        b_url: String,
        b_title: String,
        b_content: String,
        b_comments: [{
            c_url: String,
            c_name: String,
            c_comment: String
        }]
    }]
});
const cardSchema = new mongoose.Schema({
    f_url: String,
    f_title: String
});

const User = new mongoose.model('User', userSchema);
const Blog = new mongoose.model('Blog', cardSchema);

passport.use(new LocalStrategy(async (username, password, done) => {

    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return done(null, false);
        }
        if (password !== user.password) {
            return done(null, false);
        }
        return done(null, user);

    } catch (error) {
        console.log(error);
        return done(error);
    }
}))

passport.serializeUser((user, done) => {
    done(null, user.id);
})
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        console.log(error);
    }
})

function isAuthenticated(req, res, next) {
    if (req.user) {
        next();
    }
    else {
        res.redirect("login")
    }
}

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
// app.set('views', 'views')

app.get("/", async (req, res) => {
    const top = await Blog.find().sort({ _id: -1 }).limit(6);
    const remain=6-(top.length);
    const def = { f_url: "/assets/error.jpg", f_title: 'No blogs available' };
    for (let i = 1; i <= remain; i++) {
        top.push(def);
        }


    if (req.user) {
        res.render("home", {
            variable: "POST", variable2: "PROFILE"
            , cardOneImg: top[0].f_url, cardOneTitle: top[0].f_title
            , cardTwoImg: top[1].f_url, cardTwoTitle: top[1].f_title
            , cardThreeImg: top[2].f_url, cardThreeTitle: top[2].f_title
            , cardFourImg: top[3].f_url, cardFourTitle: top[3].f_title
            , cardFiveImg: top[4].f_url, cardFiveTitle: top[4].f_title
            , cardSixImg: top[5].f_url, cardSixTitle: top[5].f_title
        });
    } else {
        res.render("home", {
            variable: "Sign-in", variable2: "SIGN-IN"
            , cardOneImg: top[0].f_url, cardOneTitle: top[0].f_title
            , cardTwoImg: top[1].f_url, cardTwoTitle: top[1].f_title
            , cardThreeImg: top[2].f_url, cardThreeTitle: top[2].f_title
            , cardFourImg: top[3].f_url, cardFourTitle: top[3].f_title
            , cardFiveImg: top[4].f_url, cardFiveTitle: top[4].f_title
            , cardSixImg: top[5].f_url, cardSixTitle: top[5].f_title
        });
    }
});

app.get("/register", (req, res) => {
    res.render("register");
})

app.get("/login", (req, res) => {
    res.render("login");

})
app.get("/post",isAuthenticated, (req, res) => {
    res.render("post");
})

app.get("/direction",isAuthenticated, (req, res) => {
    if (req.user) {
        res.redirect("/post");
    } else {
        res.redirect("/login")
    }
})
app.get("/profiledirection",isAuthenticated, (req, res) => {
    if (req.user) {
        res.redirect("/profile");
    } else {
        res.redirect("/login")
    }
})

app.get("/profile", isAuthenticated, async(req, res) => {
    const user = await User.findOne({ name: req.user.name }, { b_comments: 0 });
    res.render("profile", { pic: req.user.profile_url, name: req.user.name, description: req.user.about,
    array:user.blogs });
})

app.get("/search", async (req, res) => {

    try {
        const query = req.query.query;
        const titles = await Blog.find({
            f_title: { $regex: query, $options: 'i' }
        }, 'f_title');
        res.json(titles);
    } catch (error) {
        res.status(500).json({ message: "some problem occured in /search root in server", error })
    }

})

app.get("/individual",isAuthenticated, async (req, res) => {
    const query = req.query.search;
    // console.log(query);

    const pipeline = [{ $match: { 'blogs.b_title': query } }, { $unwind: '$blogs' }, { $match: { 'blogs.b_title': query } },
    { $project: { 'username': 0, 'password': 0 } }]
    const user = await User.aggregate(pipeline);
    if(!user){
        res.send("no blog found by such title , pls refresh")
    }
    // console.log(user);

    user.forEach(element => {
        // console.log(element.blogs.b_title);
        res.render("individual", {
            title: element.blogs.b_title, pic: element.blogs.b_url,
            author_name: element.name, about_author: element.about, discription: element.blogs.b_content,
            array:element.blogs.b_comments.reverse()
        })

    });

});

app.get("/comment",isAuthenticated,async(req,res)=>{
    const comment= req.query.comment;
    const title = req.query.hidden;

    const user = await User.findOne({'blogs.b_title':title});
    const blog = user.blogs.find(e => e.b_title===title);
    blog.b_comments.push({
        c_url: req.user.profile_url,
        c_name: req.user.name,
        c_comment: comment
    }) ;

    await user.save();
    res.redirect(`/individual?search=${title}`);

});

app.get('/logout',isAuthenticated, (req, res) => {
    req.logout((error) => {
      if (error) {
        console.log(error);
      }
      res.redirect('/');
    });
  });
  
  

app.post("/register", async (req, res) => {

    try {
        const username = req.body.username;
        const password = req.body.password;

        const user = await User.findOne({ username: username });

        if (user) {
            res.send("user already exists!");
        } else {
            const newuser = new User({
                name: req.body.name,
                profile_url: req.body.photo_url,
                username: username,
                password: password,
                about: req.body.aboutYou,
                blogs: []
            })
            await newuser.save();
            res.redirect("/login");
        }
    } catch (e) {
        console.log(e);
    }

})

app.post("/login", passport.authenticate('local', { failureRedirect: '/register', successRedirect: '/' }));

app.post("/post", async (req, res) => {
    const user = await User.updateOne({ username: req.user.username },
        { $push: { blogs: { b_url: req.body.img_url, b_title: req.body.title, b_content: req.body.discription } } });

    const blog = new Blog({
        f_url: req.body.img_url,
        f_title: req.body.title
    })
    blog.save();

    res.redirect("/");
})



// app.listen(3000, () => {
//     console.log("server is listening n port http://localhost:3000");

    
// })

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));