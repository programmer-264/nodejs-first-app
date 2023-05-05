import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const app = express();

// app.use(express.static(path.join(path.resolve(), "public")));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());



// -----------------------------------------------------------MONGO DB INITIALIZATION -------------------------------

mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName : "backend",
})
.then(()=> console.log("Server connected to Backend successfully !"))
.catch(()=> "~");

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    // required: true 
});

const user = mongoose.model("Users", userSchema);



// ----------------------------------------------------------------------function------------------------------------------------


const isAuthenticated = async (req, res, next) =>{
    const {token} = (req.cookies);
    if(token){  
        const decoded = jwt.verify(token , "sdfghjkl");
        req.user = await user.findById(decoded._id) 
        next();
    }else{
        res.render("demo-page");
    }
}



app.get("/", isAuthenticated,   (req, res)=>{
    console.log(req.user)
    res.render("logout", {email : req.user.email})    
});

app.post("/" , async (req, res) =>{
    
    const {email, password} = req.body;
    const userID = await user.create({
        email,password,
    })
    
    const token = jwt.sign({_id: user._id}, "sdfghjkl");
    console.log(token);


    res.cookie("token" ,  token, {
        httpOnly : true,
        // expires : new Date(Date.now() + 10*1000),
    })
    res.redirect("/");
})

app.get("/logout",  (req, res)=>{
    res.cookie("token", null , {
        expires : new Date(Date.now()),
    })
    res.redirect("/");
})



// -----------------------------------------------------------------------SERVER listening ----------------------------------------------------------
app.listen(5000, ()=>{
    console.log("Server is live !")
})