var express=require('express');
var app=express();
var mongoose=require('mongoose');
var conn1      = mongoose.createConnection('mongodb://localhost/books');
var conn2     = mongoose.createConnection('mongodb://localhost/categories');
var conn3     = mongoose.createConnection('mongodb://localhost/book-reviews');

var cookieParser=require('cookie-parser');
var session=require('express-session');

var b=require('body-parser');
app.use(b.urlencoded({extended:true}));
var mo=require('method-override');
app.use(cookieParser());
app.use(session({secret:"Shh,its a secret"}));
app.use(mo('_method'));
app.set('view engine', 'ejs'); 

const book=conn1.model("book",new mongoose.Schema({
    title:String,
    author:String,
    description:String,
    price:Number,
    publisher:String,
    category:String,
    cover:String
}));

 const category=conn2.model("category",new mongoose.Schema({
    type:String,
   
})); 
const feedback=conn3.model("book-reviews",new mongoose.Schema({
    Book_Id:String,
    Firstname:String,
    Lastname:String,
    Country:String,
    Email:String,
    Rating:Number,
    Description:String
}));

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
     var books=new book({ 
         title:req.body.title,
         author:req.body.author,
         category:req.body.category,
         description:req.body.description,
         price:req.body.price,
         publisher:req.body.publisher,
         cover:req.body.cover
       })                     
               books.save(()=>{
                   console.log('saved');
                   res.redirect('/');
               });
})
//post a category to add
app.post("/add_category",function(req,res){
    var categories=new category({
        type:req.body.type
    })
    categories.save(()=>{
        console.log("saved");
        res.redirect('/');
    });
})
//edit book
app.get('/views/editbook.ejs/:id',function(req,res){
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
       res.redirect('/');
}).catch(err=>{
        console.log(err);
    });
});
//put a category to edit
app.post('/add_category/:id',function(req,res){
     category.findByIdAndUpdate(req.params.id,req.body).lean().then(book=>{
       res.redirect('/');
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
    res.render("feedback.ejs",{id:req.params.id});
})
//post feedback
app.post("/addreviews",function(req,res){
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
})

        


