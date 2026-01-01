import mongoose from "mongoose";

export const connectDB = async ()=>{
    try{
      const conn = await mongoose.connect(process.env.Mongo_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      



    }catch(error){
       console.log(error);
       process.exit(1);
       
    }
}
