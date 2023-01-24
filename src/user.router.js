const express=require("express")
const User=require("./user.model")
const jwt=require("jsonwebtoken")
const app=express.Router()
const secret= process.env.SECRET_PASSWORD;

app.post("/signup",async(req,res)=>{
    const {name,email,password}=req.body

    try{
        const user=await User.findOne({ email });

        if (user) {
            return res.send({ message: "user already exists,please login" });
          }
    
    if(email.includes("@masaischool")){
        await User.create({
            name,email,password,role:"admin"
          })
    }else{
        await User.create({
            name,email,password,role:"user"
          })
    }
    
         
    
          return res.status(201).send({
            message: "user created successfully",
            name,
            email,
            password,
          });
    }
    catch (err) {
        return res.send({message:err})
    }
   
})



app.post("/login",async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      if (user.password !== password) {
        return res.status(403).send({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          _id: user._id,
          email:user.email,
          password:user.password,
          role:user.role
        },
        secret,
    { expiresIn: "7 days" }
      );
    
      return res.send({ message: "login successful", token });
    }
    catch (err) {
        return res.send({ message:err})
    }
})




app.get("/",async(req,res)=>{
    let user=await User.find()
    return res.send(user)
})

module.exports =app