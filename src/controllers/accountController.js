const  connection = require("../config/connectDB")
const  jwt = require("jsonwebtoken")
const  md5 = require("md5")
const  request = require("request")
const  e = require("express")
require("dotenv").config()

let timeNow = Date.now()

const randomString = length => {
   var result = ""
   var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
   var charactersLength = characters.length
   for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
   }
   return result
}

const randomNumber = (min, max) => {
   return String(Math.floor(Math.random() * (max - min + 1)) + min)
}

const isNumber = params => {
   let pattern = /^[0-9]*\d$/
   return pattern.test(params)
}

const ipAddress = req => {
   let ip = ""
   if (req.headers["x-forwarded-for"]) {
      ip = req.headers["x-forwarded-for"].split(",")[0]
   } else if (req.connection && req.connection.remoteAddress) {
      ip = req.connection.remoteAddress
   } else {
      ip = req.ip
   }
   return ip
}

const timeCreate = () => {
   const d = new Date()
   const time = d.getTime()
   return time
}

const loginPage = async (req, res) => {
   return res.render("account/login.ejs")
}

const registerPage = async (req, res) => {
   return res.render("account/register.ejs")
}

const forgotPage = async (req, res) => {
   return res.render("account/forgot.ejs")
}

const login = async (req, res) => {
   let { username, pwd } = req.body

   if (!username || !pwd || !username) {
      //!isNumber(username)
      return res.status(200).json({
         message: "ERROR!!!",
      })
   }

   try {
      const [rows] = await connection.query("SELECT * FROM users WHERE phone = ? AND password = ? ", [username, md5(pwd)])
      if (rows.length == 1) {
         if (rows[0].status == 1) {
            const { password, money, ip, veri, ip_address, status, time, ...others } = rows[0]
            const accessToken = jwt.sign(
               {
                  user: { ...others },
                  timeNow: timeNow,
               },
               process.env.JWT_ACCESS_TOKEN,
               { expiresIn: "1d" },
            )
            await connection.execute("UPDATE `users` SET `token` = ? WHERE `phone` = ? ", [md5(accessToken), username])
            return res.status(200).json({
               message: "Login Successfully!",
               status: true,
               token: accessToken,
               value: md5(accessToken),
            })
         } else {
            return res.status(200).json({
               message: "Account has been locked",
               status: false,
            })
         }
      } else {
         return res.status(200).json({
            message: "Incorrect Username or Password",
            status: false,
         })
      }
   } catch (error) {
      if (error) console.log(error)
   }
}

const register = async (req, res) => {
   let now = new Date().getTime()
   let { username, pwd, invitecode, otp } = req.body
   let id_user = randomNumber(10000, 99999)
   // let otp2 = randomNumber(100000, 999999)
   let name_user = "Member" + randomNumber(10000, 99999)
   let code = randomString(5) + randomNumber(10000, 99999)
   let ip = ipAddress(req)
   let time = timeCreate()
   console.log("hi");

   if (!invitecode) {
      invitecode = "vpIgg59711";
   }

   if (!username || !pwd) {
      console.log(username, pwd)
      return res.status(200).json({
         message: "ERROR!!!",
         status: false,
      })
   }

   if (username.length < 9 || username.length > 10 || !isNumber(username)) {
      return res.status(200).json({
         message: "phone error",
         status: false,
      })
   }

   try {
      const [check_u] = await connection.query("SELECT * FROM users WHERE phone = ?", [username])
      const [check_i] = await connection.query("SELECT * FROM users WHERE code = ? ", [invitecode])
      //   const [check_ip] = await connection.query("SELECT * FROM users WHERE ip_address = ? ", [ip])
      console.log(check_u, check_i, 'CHECK U DATA FROM BACKEND')
      if (check_u.length == 1 && check_u[0].veri == 1) {
         return res.status(200).json({
            message: "Registered phone number",
            status: false,
         })
      }
      else {
         // if(check_u[0].otp !== otp || check_u[0].time_otp - now <= 0){
         //    return res.status(200).json({
         //       message: "Invalid OTP",
         //       status: false,
         //    })
         // }
         let otp = "0000"
         if (check_i.length == 1) {
            // if (check_ip.length <= 3) {
            let ctv = ""
            if (check_i[0].level == 2 || check_i[0] == 1) {
               ctv = check_i[0].phone
            } else {
               ctv = check_i[0].ctv
            }
            const sqlu = `
  INSERT INTO users (
    id_user, phone, name_user, password, plain_password, money,
    code, veri, otp, ip_address, status, time, win_wallet
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

await connection.execute(sqlu, [
  id_user, username, name_user, md5(pwd), pwd, 0,  // money = 0
  code, 1, otp, ip, 1, time, 0                     // win_wallet = 0
]);
            const sql = "UPDATE users SET id_user = ?,phone = ?,name_user = ?,password = ?, plain_password = ?, money = ?,code = ?,invite = ?,ctv = ?,veri = ?,otp = ?,ip_address = ?,status = ?,time = ? where phone = ?"
            await connection.execute(sql, [id_user, username, name_user, md5(pwd), pwd, 10, code, invitecode, ctv, 1, otp, ip, 1, time, username])
            await connection.execute("INSERT INTO point_list SET phone = ?", [username])

            let [check_code] = await connection.query("SELECT * FROM users WHERE invite = ? ", [invitecode])

            if (check_i.name_user !== "Admin") {
               let levels = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44]

               for (let i = 0; i < levels.length; i++) {
                  if (check_code.length >= levels[i]) {
                     await connection.execute("UPDATE users SET user_level = ? WHERE code = ?", [i + 1, invitecode])
                  } else {
                     break
                  }
               }
            }

            return res.status(200).json({
               message: "Registered successfully",
               status: true,
            })
            // } else {
            //    return res.status(200).json({
            //       message: "Registered IP address",
            //       status: false,
            //    })
            // }
         } else {
            // const sql = "UPDATE users SET id_user = ?,phone = ?,name_user = ?,password = ?, plain_password = ?, money = ?,code = ?,veri = ?,otp = ?,ip_address = ?,status = ?,time = ? WHERE phone = ?"
            // await connection.execute(sql, [id_user, username, name_user, md5(pwd), pwd, 0, code, 1, otp, ip, 1, time,username])
            // await connection.execute("INSERT INTO point_list SET phone = ?", [username])
            const sql = `
  INSERT INTO users (
    id_user, phone, name_user, password, plain_password, money,
    code, veri, otp, ip_address, status, time, win_wallet
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

await connection.execute(sql, [
  id_user, username, name_user, md5(pwd), pwd, 0,  // money = 0
  code, 1, otp, ip, 1, time, 0                     // win_wallet = 0
]);


            await connection.execute("INSERT INTO point_list (phone) VALUES (?)", [username]);

            return res.status(200).json({
               message: "Registered successfully",
               status: true,
            })
         }
      }
   } catch (error) {
      if (error) console.log(error)
   }
}

const verifyCode = async (req, res) => {
   // Extract phone number from request body
   let phone = req.body.phone;

   
 
   // Get current timestamp
   let now = new Date().getTime();
 
   // Calculate the expiry time for the OTP (2 minutes from now)
   let timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500;
 
   // Generate a random OTP (6-digit number)
   let otp = randomNumber(100000, 999999);
 
   // Check if the phone number is valid
   if (phone.length < 9 || phone.length > 10 || !isNumber(phone)) {
     return res.status(200).json({
       message: "phone error",
       status: false
     });
   }
 
   // Check if the phone number exists in the database
   const [rows] = await connection.query(
     "SELECT * FROM users WHERE `phone` = ?",
     [phone]
   );
 
   // If the phone number doesn't exist
   if (rows.length == 0) {
     // Send OTP via SMS
     await request(
       `https://sms.bulksmslab.com/SMSApi/send?userid=gamezone&password=Royal@12&sendMethod=quick&mobile=${phone}&msg=Your+OTP+is${otp}for+Phone+Verification.OTPSTE&senderid=OTPSTE&msgType=text&duplicatecheck=true&output=json`,
       async (error, response, body) => {
         let data = JSON.parse(body);
         if (data.status == "success") {
           // If OTP sent successfully, insert OTP into database
           await connection.execute(
             "INSERT INTO users SET phone = ?, otp = ?, veri = 0, time_otp = ? ",
             [phone, otp, timeEnd]
           );
           return res.status(200).json({
             message: "SMS sent sucessfully",
             status: true,
             timeStamp: timeNow,
             timeEnd: timeEnd
           });
         }
       }
     );
   } else {
     let user = rows[0];
     // Check if the OTP has expired
     if (user.time_otp - now <= 0) {
       // Send OTP via SMS
       request(
         `https://sms.bulksmslab.com/SMSApi/send?userid=gamezone&password=Royal@12&sendMethod=quick&mobile=${phone}&msg=Your+OTP+is${otp}for+Phone+Verification.OTPSTE&senderid=OTPSTE&msgType=text&duplicatecheck=true&output=json`,
         async (error, response, body) => {
           let data = JSON.parse(body);
           if (data.status == "success") {
             // If OTP sent successfully, update OTP in database
             await connection.execute(
               "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ? ",
               [otp, timeEnd, phone]
             );
             return res.status(200).json({
               message: "Submitted successfully",
               status: true,
               timeStamp: timeNow,
               timeEnd: timeEnd
             });
           }
         }
       );
     } else {
       // If OTP is still valid, but hasn't expired yet
       return res.status(200).json({
         message: "Send SMS regularly",
         status: false,
         timeStamp: timeNow
       });
     }
   }
 };
 
const verifyCodePass = async (req, res) => {
   let phone = req.body.phone
   let now = new Date().getTime()
   let timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500
   let otp = randomNumber(100000, 999999)

   if (phone.length < 9 || phone.length > 10 || !isNumber(phone)) {
      return res.status(200).json({
         message: "phone error",
         status: false,
      })
   }

   const [rows] = await connection.query("SELECT * FROM users WHERE `phone` = ? AND veri = 1", [phone])
   if (rows.length == 0) {
      return res.status(200).json({
         message: "Account does not exist",
         status: false,
         timeStamp: timeNow,
      })
   } else {
      let user = rows[0]
      if (user.time_otp - now <= 0) {
         request(`https://sms.bulksmslab.com/SMSApi/send?userid=gamezone&password=Royal@12&sendMethod=quick&mobile=${phone}&msg=Your+OTP+is${otp}for+Phone+Verification.OTPSTE&senderid=OTPSTE&msgType=text&duplicatecheck=true&output=json`, async (error, response, body) => {
            let data = JSON.parse(body)
            if (data.status == "success") {
               await connection.execute("UPDATE users SET otp = ?, time_otp = ? WHERE phone = ? ", [otp, timeEnd, phone])
               return res.status(200).json({
                  message: "Submitted successfully",
                  status: true,
                  timeStamp: timeNow,
                  timeEnd: timeEnd,
               })
            }
         })
      } else {
         return res.status(200).json({
            message: "Send SMS regularly",
            status: false,
            timeStamp: timeNow,
         })
      }
   }
}

const forGotPassword = async (req, res) => {
   let username = req.body.username
   let otp = req.body.otp
   let pwd = req.body.pwd
   let now = new Date().getTime()
   let timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500
   let otp2 = randomNumber(100000, 999999)

   if (username.length < 9 || username.length > 10 || !isNumber(username)) {
      return res.status(200).json({
         message: "phone error",
         status: false,
      })
   }

   const [rows] = await connection.query("SELECT * FROM users WHERE `phone` = ? AND veri = 1", [username])
   if (rows.length == 0) {
      return res.status(200).json({
         message: "Account does not exist",
         status: false,
         timeStamp: timeNow,
      })
   } else {
      let user = rows[0]
      if (user.time_otp - now > 0) {
         if (user.otp == otp) {
            await connection.execute("UPDATE users SET password = ?, otp = ?, time_otp = ?,plain_password = ? WHERE phone = ? ", [md5(pwd), otp2, timeEnd, pwd,username])
            return res.status(200).json({
               message: "Change password successfully",
               status: true,
               timeStamp: timeNow,
               timeEnd: timeEnd,
            })
         } else {
            return res.status(200).json({
               message: "OTP code is incorrect",
               status: false,
               timeStamp: timeNow,
            })
         }
      } else {
         return res.status(200).json({
            message: "OTP code has expired",
            status: false,
            timeStamp: timeNow,
         })
      }
   }
}

const keFuMenu = async (req, res) => {
   let auth = req.cookies.auth

   const [users] = await connection.query("SELECT `level`, `ctv` FROM users WHERE token = ?", [auth])

   let telegram = ""
   if (users.length == 0) {
      let [settings] = await connection.query("SELECT `telegram`, `cskh` FROM admin")
      telegram = settings[0].telegram
   } else {
      if (users[0].level != 0) {
         var [settings] = await connection.query("SELECT * FROM admin")
      } else {
         var [check] = await connection.query("SELECT `telegram` FROM point_list WHERE phone = ?", [users[0].ctv])
         if (check.length == 0) {
            var [settings] = await connection.query("SELECT * FROM admin")
         } else {
            var [settings] = await connection.query("SELECT `telegram` FROM point_list WHERE phone = ?", [users[0].ctv])
         }
      }
      telegram = settings[0].telegram
   }

   return res.render("keFuMenu.ejs", { telegram })
}


module.exports = {
   login,
   register,
   loginPage,
   registerPage,
   forgotPage,
   verifyCode,
   verifyCodePass,
   forGotPassword,
   keFuMenu,
}
