const nodemailer =require('nodemailer');

const sendEmail = async options=>{
    console.log("here is the options",options); 
    console.log("her user and password",process.env.KEY,process.env.PASSWORD);
    const transport = nodemailer.createTransport({
        host:process.env.HOST,

        port:process.env.PORT||25 ||587||465,
        secure:false,
        auth:{
            user:process.env.KEY,
            pass:process.env.PASSWORD
            
        }
    });
      try {
    await transport.verify();
    console.log("✅ Server is ready to take our messages");
  } catch (err) {
    console.error("❌ Error verifying transporter:", err);
    throw err; // stop here if connection fails
  }
    const mailOption={
        from:"ritik@gmail.com",
        to:options.email,
        subject:options.subject,
        text:options.message
    }
    const x= await transport.sendMail(mailOption);
    console.log("here is the valuesssss",x);
}
module.exports= sendEmail;
