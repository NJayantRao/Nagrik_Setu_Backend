import { Resend } from "resend";
import dotenv from "dotenv"
import path from "path";
import fs from "fs/promises"
import mjml2html from "mjml";

dotenv.config()

const resend= new Resend(process.env.RESEND_API);

// Wrap in an async IIFE so we can use await.
const sendMail= async (name,token) => {
    let mjmlTemplate= await fs.readFile(path.join(import.meta.dirname,"..","emails","signupMailCiv.mjml"),"utf8")
    mjmlTemplate=mjmlTemplate
    .replace(/{{logo_url}}/g,"https://res.cloudinary.com/dpwqlb3d7/image/upload/v1764314433/My%20Brand/Gemini_Generated_Image_o5l8fro5l8fro5l8_s8srd9.png")
    .replace(/{{user_token}}/g,token)
    .replace(/{{name}}/g,name)

    //Convert mjml to html
    const htmlOutput= mjml2html(mjmlTemplate).html
    const info = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: "njayantrao@gmail.com",
    subject: "Welcome to Nagrik Setu",
    // text: "Hello world?", // plain‑text body
    html: `${htmlOutput}`, // HTML body
  });
  
//   console.log(info);
  // console.log(mjmlTemplate);
//   console.log(htmlOutput);
//   console.log("Message sent:", info.messageId);
}

export {sendMail}