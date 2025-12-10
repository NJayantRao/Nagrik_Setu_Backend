import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";
import mjml2html from "mjml";

dotenv.config();

const resend = new Resend(process.env.RESEND_API);

// Wrap in an async IIFE so we can use await.
const sendMail = async (name, token, email) => {
  let mjmlTemplate = await fs.readFile(
    path.join(import.meta.dirname, "..", "emails", "signupMailAdm.mjml"),
    "utf8"
  );
  mjmlTemplate = mjmlTemplate
    .replace(
      /{{logo_url}}/g,
      "https://res.cloudinary.com/dpwqlb3d7/image/upload/v1764314433/My%20Brand/Gemini_Generated_Image_o5l8fro5l8fro5l8_s8srd9.png"
    )
    .replace(/{{uniqueId}}/g, token)
    .replace(/{{name}}/g, name);

  //Convert mjml to html
  const htmlOutput = mjml2html(mjmlTemplate).html;
  const info = await resend.emails.send({
    from: "Nagrik Setu System <system@nagriksetu.site>",
    to: email,
    subject: "Admin Account Created – Nagrik Setu",
    // text: "Hello world?", // plain‑text body
    html: `${htmlOutput}`, // HTML body
  });

  //   console.log(info);
  // console.log(mjmlTemplate);
  //   console.log(htmlOutput);
  //   console.log("Message sent:", info.messageId);
};

//Forgot Password mail
const forgotPasswordMail = async (name, token, email) => {
  let mjmlTemplate = await fs.readFile(
    path.join(import.meta.dirname, "..", "emails", "forgotPasswordAdm.mjml"),
    "utf8"
  );
  mjmlTemplate = mjmlTemplate
    .replace(
      /{{logo_url}}/g,
      "https://res.cloudinary.com/dpwqlb3d7/image/upload/v1764314433/My%20Brand/Gemini_Generated_Image_o5l8fro5l8fro5l8_s8srd9.png"
    )
    .replace(/{{otp_code}}/g, token)
    .replace(/{{admin_name}}/g, name)
    .replace(/{{current_year}}/g, new Date().getFullYear());

  //Convert mjml to html
  const htmlOutput = mjml2html(mjmlTemplate).html;
  const info = await resend.emails.send({
    from: "Nagrik Setu System <system@nagriksetu.site>",
    to: email,
    subject: "Admin Password Reset Request",
    // text: "Hello world?", // plain‑text body
    html: `${htmlOutput}`, // HTML body
  });

  //   console.log(info);
  // console.log(mjmlTemplate);
  //   console.log(htmlOutput);
  //   console.log("Message sent:", info.messageId);
};

const sendStaffMail = async (name, token, email) => {
  let mjmlTemplate = await fs.readFile(
    path.join(import.meta.dirname, "..", "emails", "signupMailStaff.mjml"),
    "utf8"
  );
  mjmlTemplate = mjmlTemplate
    .replace(
      /{{logo_url}}/g,
      "https://res.cloudinary.com/dpwqlb3d7/image/upload/v1764314433/My%20Brand/Gemini_Generated_Image_o5l8fro5l8fro5l8_s8srd9.png"
    )
    .replace(/{{staffId}}/g, token)
    .replace(/{{name}}/g, name);

  //Convert mjml to html
  const htmlOutput = mjml2html(mjmlTemplate).html;
  const info = await resend.emails.send({
    from: "Nagrik Setu Admin <admins@nagriksetu.site>",
    to: email,
    subject: "Staff Account Created – Nagrik Setu",
    // text: "Hello world?", // plain‑text body
    html: `${htmlOutput}`, // HTML body
  });

  //   console.log(info);
  // console.log(mjmlTemplate);
  //   console.log(htmlOutput);
  //   console.log("Message sent:", info.messageId);
};

export { sendMail, forgotPasswordMail, sendStaffMail };
