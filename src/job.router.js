const express=require("express")
const Job=require("./job.model")
const jwt=require("jsonwebtoken")
const app=express.Router()
const secret= process.env.SECRET_PASSWORD;


let blackList=[]
const authMiddleware=async(req,res,next)=>{
     let token=req.body.headers["authorization"]
    //let token=req.headers["authorization"]

    console.log(req)
    if(!token){
        return res.status(401).send("You are not authorized")
    }
    if(blackList.includes(token)){
        return res.send(401).send("Token expired")
    }
    try{
        const verification = await jwt.verify(token,secret)
        console.log(verification)
        if(verification)
        {
            req.userId=verification._id
            req.role=verification.role
            console.log(req.userId)
            next()
        }
        else{
            res.send("Authentication Fail")
        }

    }catch(e){
        res.send(e.message)
    }
}


app.get("/",async(req,res)=>{
    let {location,contract}=req.query
    try{
        if(location&&contract)
        {
            let job=Job.find({location:location,contract:contract})
            return res.send({message:"success",data:job})

        }
        else if(contract)
        {
            let job=Job.find({contract:contract})
            return res.send({message:"success",data:job})

        }
        else if(location)
        {
            let job=Job.find({location:location})
            return res.send({message:"success",data:job})

        }
        else{
            let job=await Job.find()
        return res.send({message:"success",data:job})
        }
        

    }catch(e){
        return res.send({message:e.message})
    }
})
app.delete("/:id",async(req,res)=>{

    let id=req.params.id
    console.log(id)
    try{
        
        await Job.findByIdAndDelete(id)
        return res.send({message:"Job deleted successfully"})
    }
    catch(e){
        return res.send({message:e.message})
    }
})


app.use(authMiddleware)


app.post("/",async(req,res)=>{
    let {company,position,contract,location}=req.body.body
    console.log(req.userId)
    try{
        if(req.role!="admin"){
            return res.send({message:"You have not access to post job"})
        }
        await Job.create({
            company,position,contract,location,userId:req.userId
        })
        return res.send({message:"Job added successfully"})
    }catch(e){
        return res.send({message:e.message})
    }
})

app.get("/myJobs",async(req,res)=>{
    try{
        if(req.role!="admin"){
            return res.send({message:"You are not admin"})
        }
        let jobs=await Job.find({userId:req.userId})
        return res.send({data:jobs})
    }
    catch(e){
        return res.send({message:err})
    }
})




module.exports = app