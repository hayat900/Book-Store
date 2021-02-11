var express=require('express');
var app=express();
var mongoose=require('mongoose');
var conn1      = mongoose.createConnection('mongodb://localhost/books');
var conn2     = mongoose.createConnection('mongodb://localhost/categories');
var conn3     = mongoose.createConnection('mongodb://localhost/breviews');

var cookieParser=require('cookie-parser');
var session=require('express-session');
var createError = require('http-errors');
var path = require('path');
var logger = require('morgan');
var passport = require('passport');
var expressValidator = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
var multer = require('multer');
var upload = multer({dest: './uploads'});
var flash = require('connect-flash');
mongoose.connect("mongodb://localhost/Mylogin",{useNewUrlParser:true,useUnifiedTopology:true});

var db = mongoose.connection;
app.use(flash());
app.use(logger('dev'));
app.use(express.json());
var b=require('body-parser');
app.use(b.urlencoded({extended:true}));
var mo=require('method-override');
app.use(cookieParser());
app.use(session({secret:"Shh,its a secret"}));
app.use(mo('_method'));
app.set('view engine', 'ejs'); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
var Schema=mongoose.Schema
 var UserSchema=new Schema({
        email:{type:String,required:true},
        password:{type:String,required:true},
     profilepic:{type:String}
    });
const Lo=mongoose.model('lo',UserSchema)


const book=conn1.model("book",new mongoose.Schema({
    title:String,
    author:String,
    description:String,
    price:String,
    publisher:String,
    category:String,
    cover:String
}));

 const category=conn2.model("category",new mongoose.Schema({
    type:String,
   
})); 
const feedback=conn3.model("breviews",new mongoose.Schema({
    Book_Id:String,
    Firstname:String,
    Lastname:String,
    Country:String,
    Email:String,
    Rating:Number,
    Description:String
}));
app.get('/register',function(req,res){
    res.render("register.ejs",{title:"register",errors:''});
});
app.post('/register',upload.single('pic'),function(req,res){
    if(req.file){
        console.log(req.file);
            var profilepic=req.file.filename;
    }
    else{
        console.log("no file");
      var profilepic="no file";
    }
    var email=req.body.email;
    var password1=req.body.password1;
     var password2=req.body.password2;
    
    req.checkBody('email',"enter valid email").isEmail();
        req.checkBody('password1',"enter same passwords").equals(password2);
 req.checkBody('password1',"enter a password").notEmpty();
    var errors=req.validationErrors();
    console.log(errors);
        if(errors==true)
            res.render("register.ejs",{errors:errors,title:"register"});
        else
{
   
            var lo=new Lo({ 
                email:req.body.email,
               password:req.body.password1,
            profilepic:profilepic
            })
               lo.save(()=>{
                   console.log('saved');
                 req.flash('success','You have successfully registered and can login');
                   res.locals.message=req.flash();
                   res.render('login',{title:"login",errors:"",msg2:""});
               });
        }
});

    

app.get('/login',function(req,res){
    res.render("login.ejs",{title:"login",errors:"",msg2:""});
});
app.post('/login',function(req,res){
   
    Lo.findOne({email:req.body.email},function(err,user){
       if(err){
           console.log(err);
       }
       else if(!user)
       {
            req.flash('error','invalid credentials2');
            res.locals.message=req.flash();
           res.render('login',{title:"login",msg2:"",errors:""});
       }
        else if(user.password!=req.body.password)
            {
                console.log(user.password);
                console.log(req.body.password);
                 req.flash('error','invalid credentials1');
            res.locals.message=req.flash();
               res.render('login',{msg2:' Invalid credentials',title:"login",errors:""}); 
            }
        else{
             req.flash('success','You have successfully logged in');
                   res.locals.message=req.flash();
           book.find().then(books=>{
       
        res.render("viewbooks.ejs",{books:books})
    })
        .catch(err=>{
       console.log("err");
   });
        }
      
       });
   
})
app.get('/manage',function(req,res){
    res.render("index.ejs",{title:"express",message:""});
});
app.listen(3000,function(request,response){
   
            console.log("running successfully");
})


app.get('/',function(req,res){
    
     book.find().then(books=>{
       
        res.render("home.ejs",{books:books})
    })
        .catch(err=>{
       console.log("err");
   });
})
//view all books
app.get('/views/viewbooks.ejs',function(req,res){
     
    book.find().then(books=>{
       
        res.render("viewbooks.ejs",{books:books})
    })
        .catch(err=>{
       console.log("err");
   });
        

});
//view all categories
app.get('/views/viewcategories.ejs',function(req,res){
   
    category.find().then(categories=>{
        res.render("viewcategories.ejs",{categories:categories})
    })
        .catch(err=>{
       console.log("err");
   });
        

});
//add new book
app.get("/views/addbook.ejs",function(req,res){
    console.log("I am in add books");
    category.find().then(categories=>{
        res.render("addbook.ejs",{categories:categories})
    })
        .catch(err=>{
       console.log("err");
   });
})
//add new category
app.get("/views/addcate.ejs",function(req,res){
    res.render("addcate.ejs");
})
//post a book to add
app.post("/add_book",function(req,res){
     var book1=new book({ 
         title:req.body.title,
         author:req.body.author,
         category:req.body.category,
         description:req.body.description,
         price:req.body.price,
         publisher:req.body.publisher,
         cover:req.body.cover
       })                     
               book1.save(()=>{
                   console.log('saved book');
                   book.find().then(books=>{
                       console.log(books);
                   });
                   res.redirect('/views/viewbooks.ejs');
               });
})
//post a category to add
app.post("/add_category",function(req,res){
    var categories=new category({
        type:req.body.type
    })
    categories.save(()=>{
        console.log("saved");
        res.redirect('/views/viewbooks.ejs');
    });
})
//edit book
app.get('/editbook.ejs/:id',function(req,res){
    book.findById(req.params.id,function(err,books){
        console.log(books.description);
        console.log(books.category);
         category.find().then(categories=>{
        res.render("editbook.ejs",{categories:categories,books:books})
    })
        .catch(err=>{
       console.log("err");
   });
       
});
});
//edit a category
app.get('/editcat.ejs/:id',function(req,res){
    category.findById(req.params.id,function(err,categories){
       
         
        res.render("editcat.ejs",{categories:categories});
    })
        .catch(err=>{
       console.log("err");
   });
       
});

//put a book to edit
app.post('/add_book/:id',function(req,res){
     book.findByIdAndUpdate(req.params.id,req.body).lean().then(book=>{
       res.redirect('/views/viewbooks.ejs');
}).catch(err=>{
        console.log(err);
    });
});
//put a category to edit
app.post('/add_category/:id',function(req,res){
     category.findByIdAndUpdate(req.params.id,req.body).lean().then(book=>{
       res.redirect('/views/addcate.ejs');
}).catch(err=>{
        console.log(err);
    });
});

//delete a book
app.delete('/delete_book/:id',function(req,res){
        console.log("DELETE review")
  book.findByIdAndRemove(req.params.id).then((review) => {
    res.redirect('/views/viewbooks.ejs');
  }).catch((err) => {
    console.log(err.message);
  })
        })
        
        //delete a category
        app.delete('/delete_cat/:id',function(req,res){
        console.log("DELETE category")
  category.findByIdAndRemove(req.params.id).then((review) => {
    res.redirect('/views/viewcategories.ejs');
  }).catch((err) => {
    console.log(err.message);
  })
        })

//details
app.get('/details/:id',function(req,res){
    book.findById(req.params.id,function(err,books)
                  {
        feedback.find({Book_Id:req.params.id},function(err,reviews)
                  {
        console.log(reviews);
        //res.send("hello");
            var total=0;
            for(var i=0;i<reviews.length;i++)
                {
                     total=total+reviews[i].Rating
                }
            total=total/reviews.length;
                     res.render("details.ejs",{book:books,review:reviews,total:total});
                  }
                 )
        .catch(err=>{
       console.log(err);
   });
                     
                  }
                 )
        .catch(err=>{
       console.log(err);
   });
    })

app.get('/addcart',function(req,res){
    var cart=req.session.cart;
    var displayCart={items:[],total:0,qty:0};
    var total=0,qty=0;
    for(var item in cart){
        displayCart.items.push(cart[item]);
        total+=(cart[item].qty*cart[item].price);
        qty+=(cart[item].qty);
    }
    displayCart.total=total;
    displayCart.qty=qty;
    console.log("cart"+JSON.stringify(cart));
    console.log("display"+JSON.stringify(displayCart));
    //res.send("hello");
    res.render("cart.ejs",{cart:displayCart});
    });
app.post('/addcart/:id',function(req,res){
    req.session.cart=req.session.cart || {};
    var cart=req.session.cart;
    book.findOne({_id:req.params.id},function(err,book){
        if(err)
            {
                console.log(err);
            }
        if(cart[req.params.id])
            {
                cart[req.params.id].qty++;
            }
        else{
            cart[req.params.id]={
                item:book._id,
                title:book.title,
                price:book.price,
                qty:1
                
            }
        }
        res.redirect('/addcart');
    });
})
//remove cart
app.get('/cart/remove',function(req,res){
    req.session.destroy();
    res.redirect('/addcart');
})

//view feedback
app.get('/reviews/:id',function(req,res){
    feedback.find({Book_Id:req.params.id},function(err,reviews)
                  {
        console.log(reviews);
        //res.send("hello");
                     res.render("showfeedback.ejs",{review:reviews});
                  }
                 )
        .catch(err=>{
       console.log("err");
   });
    })
//give feedback page
app.get('/addreviews/:id',function(req,res){
    res.render("feedback.ejs",{id:req.params.id,errors:""});
})
//post feedback
app.post("/addreviews",function(req,res){
    req.checkBody(req.body.Subject,"enter your review").notEmpty();
    var errors=req.validationErrors();
    console.log(errors);
        if(errors==true)
            res.render("feedback.ejs",{errors:errors,id:req.body.Book_Id});
        else
{
     var feedbacks=new feedback({ 
         Firstname:req.body.Firstname,
         Lastname:req.body.Lastname,
         Book_Id:req.body.Book_Id,
         Description:req.body.Subject,
         Rating:req.body.Rating,
         Email:req.body.Email,
         Country:req.body.Country
       })                     
               feedbacks.save(()=>{
                   console.log('saved');
                   feedback.find(function(err,info){
                       if(err)
                           console.log(err);
                       else
                           console.log(info);
                   })
                   res.redirect('/');
               });
}
})

        


