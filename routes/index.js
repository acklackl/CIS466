var express = require('express');
var router = express.Router();
var request = require('request');
var unirest = require('unirest');
var nodemailer = require('nodemailer');

//title
const title = "Mighty Morphin Store";

//status
var status = "Logged out";


//email config
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
         user: 'noreply.mightymorphin@gmail.com',
         pass: 'testAdmin'
     }
 });

/*Function to validate if passwords are matching password*/
function validateInfo(email, password, confirmPassword) {
  if (password == confirmPassword) {
    return true;
  }
  else {
    return false;
  }
}

/*Function to validate if password has at least 1 special character, 1 upper case letter, 1 lower case letter, 6 characters, and 1 number*/


/* GET home page. */
router.get('/', function(req, res, next) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  var email = req.cookies.email;
  if (req.cookies.token !== undefined) {status = "Logged in";}
  else {
    res.clearCookie('token');
    res.clearCookie('email');
    res.clearCookie('user');
  }
    res.render('index', {title : title, status: status, alert: false, alertContent: ''});
});


/* GET Products Page */
router.get('/product', function(req, res, next) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  request('https://localhost:44338/api/product', (err, response, body) => {
if (err) { return console.log(err); res.render('index', {title: title, status: status, alert: true, alertContent: 'Unknown Error'}); /*unknown error*/}
  else {
    if (req.cookies.token !== undefined) {status = "Logged in"}
      res.render('product', { title: title, data: JSON.parse(body), status: status, alert: false, alertContent: ''});
    }
  });
});

/*GET Cart Page */
router.get('/cart', function(req, res, next) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  if (req.cookies.token !== undefined) { //if user is logged in then send a get request to get the cart for user based on cookie
    status = "Logged in";
    request({uri: 'https://localhost:44338/api/cart/' + req.cookies.user, json: true, headers: {Authorization : 'Bearer ' + req.cookies.token}}, (err, response, body) => { 
      if (err) { return console.log(err); res.render('index', {title: title, status: status, alert: true, alertContent: 'Unknown error'}); /*unknown error*/}
      else {
        var disabled = '';
        if (Object.keys(body[0].products).length === 0 && (body[0].products).constructor === Object)  { disabled = 'disabled';}
        res.render('cart', {title: title, status: status, data: body[0], alert: false, alertContent: '', disabled: disabled});
      }
    });
  }
  else {res.render('index', {title: title, status: status, alert: true, alertContent: 'Login to view your cart.'});}
});

/*GET order page*/ 
router.get('/order', function(req, res, next) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  if (req.cookies.token !== undefined) { //if user is logged in then send a get request to get the cart for user based on cookie
    status = "Logged in";
    request({uri: 'https://localhost:44338/api/cart/' + req.cookies.user, json: true, headers: {Authorization : 'Bearer ' + req.cookies.token}}, (err, response, body) => { 
      if (response.statusCode == 401) { return console.log(err); res.render('index', {title: title, status: status, alert: true, alertContent: 'Unknown error'}); /*unknown error*/}
      else {res.render('order', {title: title, status: status, alert: false, total: body[0].subTotal});}
    });
  }
  else {res.render('index', {title: title, status: status, alert: true, alertContent: 'Login to make an order.'});}
});

/*GET order history page*/
router.get('/order/history', function(req, res, next) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  if (req.cookies.token === undefined) { 
    status = "Logged out" 
    res.render('index', {title: title, status: status, alert: true, alertContent: 'Login to view your order history.'});
  }
  else {
    status = "Logged in"
    request({ uri: 'https://localhost:44338/api/order/' + req.cookies.user, json : true, headers: {Authorization : 'Bearer ' + req.cookies.token}}, function (err, response, body) {
      if (err) {res.render('index', {title : title, status: status, alert: true, alertContent: 'Unknown error'})}
      else {
        data = response.body;
        res.render('viewOrders', {title: title, data: data, status: status});
      }
    })   
  }
})

/* GET Register Page */
router.get('/register', function(req, res, next) {
  if (req.cookies.token !== undefined) {
    status = "Logged in";
    res.render('index', {title: title, status: status, alert: true, alertContent: 'Already logged in, logout to register.'});//not logged in
    //res.render('register', {title: 'Mighty Morphin Store', status: 'Currently Logged in.', email:'', name: '', phone: '', alert: true, alertContent: 'Already logged in, logout to register.'});
  }
  else {
    res.render('register', { title: 'Mighty Morphin Store', status: '', email: '', name: '', phone: '', alert: false, alertContent: ''});
  }
});

/* GET Login Page */
router.get('/login', function(req, res, next) {
  if (req.cookies.token !== undefined) {
    status = "Logged in"
    res.render('index', {title: title, status: status, alert: true, alertContent: 'You are already logged in.'}); /*You are already logged in*/}
  else {
    res.render('login', {title : 'Mighty Morphin Store', status: '', alert: false, alertContent: ''});
  }
});

/*GET Forgot Password */
router.get('/forgotpassword', function(req, res, next) {
  if (req.cookies.token !== undefined) {
    res.render('login', {title : 'Mighty Morphin Store', status: '', alert: true, alertContent: 'You are logged in already.'});
  }
  else {
    res.render('forgotPassword', {title: title, status: '', alert: false, alertContent: ''});
  }
});

/* GET Reset Password */
router.get('/resetpassword', function(req, res, next) {
  var url = "?user=" + req.query.user + "&coin=" + req.query.coin;
  res.render('resetPassword', {title: title, status: '', data : url, alert: false, alertContent: ''});
});

/* GET Logout */
router.get('/logout', function(req, res, next) {
  if (req.cookies.token === undefined) {status = 'Logged out'; res.render('index', {title: title, status: status, alert: true, alertContent: 'You are already logged out.'});/*You are already logged out*/}
  else {
    res.clearCookie('token');
    res.clearCookie('user');
    res.clearCookie('email');
    //pop up modal saying you have logged out
    status ="Logged out"
    res.render('index', {title: title, status: status, alert: true, alertContent: 'Logout successful.'}); //Logout successful
  }
});

/* POST product orderline */
router.post('/product', function(req, res, next) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  if (req.cookies.token === undefined) {
    request('https://localhost:44338/api/product', (err, response, body) => {
      if (err) {console.log(err); }
      else {
        res.render('product', {title: title, data: JSON.parse(body), status: status, alert: true, alertContent: 'You have to be logged in to add items to cart.'}); /*You have to be logged in to add items to cart */
      }
    });   
  }
  else {
    var productID = req.body.productID;
    var quantity = req.body.quantity;
    var customerID = req.cookies.user;
    unirest.post('https://localhost:44338/api/orderline')
    .headers({'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization' : 'Bearer ' + req.cookies.token})
    .send({ 
      "productID" : productID,
      "cartID" : customerID,
      "quantity" : quantity,
      "customerID" : customerID
          })
    .end(function (response) {
      if (response.statusCode !== 204) {
        request('https://localhost:44338/api/product', (err, response, body) => {
          if (err) {console.log(err); }
          else {
            res.render('product', {title: title, data: JSON.parse(body), status: status, alert: true, alertContent: 'This item is already in your cart. Change the quantity instead.'});
          }
        }); //Item already in cart
      }
      else {
        request('https://localhost:44338/api/product', (err, response, body) => {
          if (err) {console.log(err); }
          else {
            res.render('product', {title: title, data: JSON.parse(body), status: status, alert: true, alertContent: 'Success! This item was added to your cart.'});
          }
        });
      }
    });
  }
});

/*POST Cart (patch orderline delete orderline)*/
router.post('/cart/delete', function (req, res, next) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  if (req.cookies.token === undefined) {
    res.render('index', {title: title, status: status, alert: true, alertContent: 'Error! You were logged out. Please login and try again.'}); 
  }
  else {
    unirest.delete('https://localhost:44338/api/orderline/' + req.body.orderLineID)
    .headers({'Authorization' : 'Bearer ' + req.cookies.token})
    .end(function (response) {
      if (response.statusCode !== 204) {
        res.render('index', {title: title, status: status, alert: true, alertContent: 'Error! Something went wrong.'});
      }
      else {
        res.redirect('/cart');
      }
    })
    ;
  }
});

/*POST Cart (patch orderline update quantity) */
router.post('/cart/update', function (req, res, next) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  if (req.cookies.token === undefined) {
    res.render('index', {title: title, status: status, alert: true, alertContent: 'Error! You were logged out. Please login and try again.'}); 
  }
  else {
    unirest.patch('https://localhost:44338/api/orderline/' + req.body.orderLineID)
    .headers({'Accept' : 'application/json', 'Content-Type' : 'application/json', 'Authorization' : 'Bearer ' + req.cookies.token})
    .send([{"op" : "replace", "path" : "/quantity", "value" : req.body.quantity}])
    .end(function (response) {
      if (response.statusCode !== 204) {
        res.render('index', {title: title, status: status, alert: true, alertContent: 'Error! Something went wrong with your order! Please try again.'});
      }
      else {
        res.redirect('/cart');
      }
    })
  }
})


/* POST Order */
router.post('/order', function(req, res, next) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  if (req.cookies.token === undefined) {
    res.render('index', {title: title, status: status, alert: true, alertContent: 'Error! You were logged out. Please login and try again.'}); 
  }
  else {
    unirest.post('https://localhost:44338/api/order')
    .headers({'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization' : 'Bearer ' + req.cookies.token})
    .send({
        "billingAddress" : req.body.billingStreet + " " + req.body.billingFloor + ", " + req.body.billingCity + ",\n" + req.body.billingState + " " + req.body.billingZip,
        "shippingAddress" : req.body.shippingStreet + " " + req.body.shippingFloor + ", " + req.body.shippingCity + ",\n" + req.body.shippingState + " " + req.body.shippingZip,
        "creditCard" : req.body.ccNumber,
        "customerID" : req.cookies.user
    })
    .end (function (response) {
      if (response.statusCode == 500) {
        //error
        res.render('index', {title: title, status: status, alert: true, alertContent: 'Error! Something went wrong with your order! Please try again.'}); 
      }
      else {
        
        //alter orderlines to have the new orderid
        setTimeout( function() {
          request({uri: 'https://localhost:44338/api/cart/' + req.cookies.user, json: true, headers: {Authorization : 'Bearer ' + req.cookies.token}}, (err, resp, body) => {
            if (err) {console.log(err)}
            else {    
                var emailBody = "<h1>Your Order:</h1><br/>";
                var subTotal = 0;
                for (var product in body[0].products) {
                  emailBody += body[0].products[product][0] + " <b>(" + body[0].products[product][2] + ")</b>" + "    $" + parseFloat(body[0].products[product][1])  + "<br/>";
                  subTotal += parseFloat(body[0].products[product][1]);
                  unirest.patch('https://localhost:44338/api/orderline/' + body[0].products[product][4])
                  .headers({'Accept' : 'application/json', 'Content-Type' : 'application/json', 'Authorization' : 'Bearer ' + req.cookies.token})
                  .send(
                    [{"op" : "replace", "path" : "/cartID", "value" : null},
                    {"op" : "replace", "path" : "/orderID", "value" : response.body.orderID}
                    ]
                  )
                  .end( function (r) {
                    //console.log(r.statusCode);
                          
                  })
                }
                console.log(subTotal);
                emailBody += "<b>Grand Total</b>:    $" + subTotal; 
  
              //post email, tell user to check their email
              var mailOptions = {
                from: 'noreply.mightymorphin@gmail.com', // sender address
                to: req.cookies.email, // list of receivers
                subject: 'Order# ' + response.body.orderID, // Subject line
                html: emailBody // plain text body
              };
              
              transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                  {res.render('index', {title: title, status: status, alert: true, alertContent: 'Success! Your order was placed. However, we couldn\'t email your receipt!'});}
                else
                  {res.render('index', {title: title, status: status, alert: true, alertContent: 'Success! Your order was placed. Check email for your receipt!'});} 
              });
            }
          })
        }, 1000); 
      }    
    });
  }
});


/* POST Login */
router.post('/login', function(req, res, next) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  var email = req.body.email;
  var password = req.body.psw;
  if (req.cookies.token === undefined) {
    unirest.post('https://localhost:44338/account/login')
      .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
      .send({ "email" : email, "password" : password })
      .end(function (response) {
        if (response.statusCode != 200) {res.render('login', {title: title, status: '', alert: true, alertContent: 'Login failed, password or email was incorrect.'}); /*login failed, password or email was incorrect */}
        else {
          status = "Logged in"
          var tokenCookie = req.cookies.token;
          var userCookie = req.cookies.user;
          res.cookie('token', response.body, {maxAge: 9000000});
          res.cookie('email', email, {maxAge: 9000000});
          request('https://localhost:44338/api/customer/' + email, {json: true}, (err, response, body) => {
            //console.log(body);
            res.cookie('user', body[0].customerID, {maxAge: 9000000});
            res.render('index', {title: title, status: status, alert: true, alertContent: 'Success! You are now logged in.'}); //success you are now logged in
          });
        }
      });
  }
else {res.render('index', {title: title, status: status, alert: true, alertContent: 'You are already logged in'}); /*you are already logged in */}    
});

/* POST Register */
router.post('/register', function(req, res, next) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  var email = req.body.email;
  var password = req.body.psw;
  var name = req.body.name;
  var phone = req.body.phone;
  var confirmPassword = req.body['psw-repeat'];
  var ok = true;
  if (req.cookies.token === undefined) {
        if (validateInfo(email, password, confirmPassword)) { 
          unirest.post('https://localhost:44338/account/register')
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .send({ "email" : email, "password" : password })
            .end(function (response) {
              if (response.statusCode != 200) {res.render('index', {title: title, status: status, alert: true, alertContent: 'Unknown Error.'}); /*unknown error*/}
              else {        
                //make post request to customer table
                unirest.post('https://localhost:44338/api/customer')
                  .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                  .send({ "customerName" : name,
                          "email" : email,
                          "phone" : phone
                         })
                  .end(function (response) {
                    unirest.post('https://localhost:44338/api/cart')
                    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                    .send({ "customerID" : response.body.customerID
                          })
                    .end(function (response) {
                      console.log(response);
                  });
                });
                res.cookie('token', response.body, {maxAge: 9000000});
                res.cookie('email', email, {maxAge: 9000000});
                setTimeout( function() {
                  request('https://localhost:44338/api/customer/' + email, {json: true}, (err, response, body) => {
                    res.cookie('user', body[0].customerID, {maxAge: 9000000});
                    res.render('index', {title: title, status: status, alert: true, alertContent: 'Success! You are now registered.'}); //Success You are now registered
                  })}, 1000
                );
              }
            });
        }
        else {res.render('index', {title: title, status: status, alert: true, alertContent: 'Registration failed. Passwords didn\'t match.'}); /*registration failed passwords don't match*/}
  }
else {res.render('index', {title: title, status: status, alert: true, alertContent: 'You are currently logged in. To register for a new account, logout.'}); /*currently logged in, to register an account have to logout*/}
});

/*POST forgot password */
router.post('/forgotpassword', function(req, res, next) {
  
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  unirest.post('https://localhost:44338/account/forgotpassword')
  .headers({'Accept' : 'application/json', 'Content-Type' : 'application/json'})
  .send({
    "email" : req.body.email
  })
  .end(function (response) {
    if (response.statusCode !== 200) {
      res.render('forgotPassword', {title: title, status: '', alert: true, alertContent: 'Failed! You likely entered the wrong email.'});
    }
    else {
      status ='Logged out'
      res.render('index', {title: title, status: status, alert: true, alertContent: 'Success! Check your email for the reset password link.'})
    }
  })

})

/* POST reset password */
router.post('/resetpassword', function(req, res, next) {
  
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  var user = req.query.user;
  var coin = req.query.coin;
  var pass = req.body.psw;
  var confPass = req.body["psw-repeat"];
          
  unirest.post('https://localhost:44338/account/resetpassword')
  .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
  .send({
      "user" : user,
      "coin" : coin,
      "pass" : pass,
      "confPass" : confPass
  })
  .end(function (response) {
      if (!response.body.succeeded) {
        res.render('index', {title: title, status: status, alert: true, alertContent: 'Reset password failed, link is no longer valid.'}); //reset password failed, link is no longer failed
      }
      else {
        res.render('index', {title: title, status: 'Logged out', alert: true, alertContent: 'Success! Password was reset.'}); //success, password was reset
      }
  });
});

/* GET orders */
/*router.get('/order', function(req, res, next) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  request('https://localhost:44338/api/order', {json : true}, (err, response, body) => {
    if (err) { return console.log(err); }
    var status = "Not currently logged in.";
    if (req.cookies.token !== undefined) {
      status = "Currently Logged in."
    }
    res.render('index', { title: 'Mighty Morphin Store', data: JSON.stringify(body), status: status, alert: false, alertContent: ''});
  });
});*/

/*GET customers */
router.get('/customer', function(req, res, next) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  request('https://localhost:44338/api/customer', {json : true}, (err, response, body) => {
    if (err) { return console.log(err); }
    var status = "Logged out";
    if (req.cookies.token !== undefined) {
      status = "Logged in"
    }
    res.render('index', { title: 'Mighty Morphin Store', data: JSON.stringify(body), status: status, alert: false, alertContent: ''});
  });
});

module.exports = router;

/*NOTES:

In order to make a request with the Authorization header to access authorized things, set the 'Authorization' to 'Bearer ' + req.cookies.token.
For get request example:

  request({uri : 'https://localhost:44338/api/product', json: true, headers: {'Authorization' : 'Bearer ' + req.cookies.token}}, (err, response, body) => {
    if (err) { return console.log(err); }

    res.render('index', { title: 'Mighty Morphin Store', data: JSON.stringify(body)});
  });

For post request example:
  unirest.post('https://localhost:44338/api/product')
    .headers({'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization' : 'Bearer ' + req.cookies.token})
    .send({ "productName" : req.body.productName,
            "productBrand" : req.body.productBrand })
    .end(function (response) {
      if (response.statusCode != 200) {
        //didn't work
      }
      else {
        //success
        }
      }
    }); 

  TODO: Handle reponse.statusCode == 401 (unauthorized), handle any other statuscodes
  LOGOUT: Delete cookie


*/