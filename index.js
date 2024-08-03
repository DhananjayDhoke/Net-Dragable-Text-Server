const express = require("express")
const mysql = require("mysql");
const cors = require('cors')
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
// Increase payload size limit
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json()) 
app.use(cors())

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});


dotenv.config();
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE

})


const uploadsfile = path.join(__dirname, "./uploads");
app.use("/uploads",express.static(uploadsfile));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,"./uploads"))
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now()+ Math.random().toString();
    cb(null, uniquePrefix+file.originalname)
  }
})

const upload = multer({ storage: storage })


  // login employee
  app.post("/login",(req,res)=>{
    const {userId,password} = req.body;

    //console.log("inside login",empId,password)
    const query = 'select * from login_mst where username =? and password = ?';

    db.query(query,[userId,password],(err,result)=>{
        if(err){

          res.status(500).json({error:err})
        }
        else if(result.length===0){
          res.status(401).json({message:"Invalid Email or Password"})
        }
        else{
          //console.log("else block",result)
          const user = result[0];
          console.log(user)
          if(password==user.password){
           res.json({message:"Login successful",errorCode:1 ,userId:user.userid})
          }
          else{
            res.status(401).json({message:"Invalid Email or Password"})
          }
        }
    })


  })


   // add doctor 
 app.post('/upload',upload.single('image'), (req, res) => {
  const {userId,catId, subCatId} = req.body;
  console.log("inside upload",subCatId)
  const {filename} = req.file 
  //const query = 'INSERT INTO image_mst (image_name,created_by,cat_id) VALUES (?,?,?)';
  const query = 'CALL insert_or_update_image(?,?,?,?)'
  db.query(query, [filename,userId,catId,subCatId], (error, results) => {
    if (error) {
      console.error('Error saving image data: ', error);
      res.status(500).json({ error: 'Failed to add doctor data' });
      
    }
    else{

      res.status(200).json({ message: 'Image uploaded successfully' });
    } 
  });
});

app.post("/getImages", (req, res) => {
   
  const {subCatId} = req.body;
  const query = "select * from image_mst where subcat_id = ?";
  db.query(query,[subCatId], (err, rows) => {
    if (err) {
      res.send(err);
    } else {
      res.send( rows ); 
    }
  });
});

app.post('/deleteImage',(req,res)=>{
     
     const {imgId} = req.body;
     const query = 'Delete from image_mst where imid = ?'
     db.query(query,[imgId],(err,result)=>{
         
      if(err){
        res.send(err)
      }
      else{
        res.send(result)
      }
     })
})

app.get("/getCategory", (req, res) => {

  const query = "select * from category_mst";
  db.query(query, (err, rows) => {
    if (err) {
      res.send(err);
    } else {
      res.send( rows ); 
    }
  });
});

app.post("/getSubCategory", (req, res) => {
  const {catId} = req.body;
  console.log(catId)
  const query = "select * from subcategory_mst where cat_id = ? and status = 'Y'";
  db.query(query,[catId], (err, rows) => {
    if (err) {
      res.send(err);
    } else {
      res.send( rows ); 
    }
  });
});


app.get("/getFontFamily", (req, res) => {

  const query = "select id,name,value from font_family_mst where status = 'Y'";
  db.query(query, (err, rows) => {
    if (err) {
      res.send(err);
    } else {
      res.send( rows ); 
    }
  });
});

app.get("/getFontWeight", (req, res) => {

  const query = "select id,name,value from font_weight_mst where status = 'Y'";
  db.query(query, (err, rows) => {
    if (err) {
      res.send(err);
    } else {
      res.send( rows ); 
    }
  });
});

app.get("/getFontColor", (req, res) => {

  const query = "select id,name,code from font_color_mst where status = 'Y'";
  db.query(query, (err, rows) => {
    if (err) {
      res.send(err);
    } else {
      res.send( rows ); 
    }
  });
});
const PORT = process.env.PORT || 8081
app.listen(PORT,()=>{
    console.log(`listining on port ${PORT} `)
})