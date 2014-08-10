Splifed_Drywall
===============

This repo is a restructure of the drywall project.
From the issue in the jedireza/drywall project named Structural proposition (https://github.com/jedireza/drywall/issues/212).


SO first my file hierarchy and with * are things i have changed :
-configurator * <br>
-controllers *  <br>
-layouts <br>
-models *<br>
-public<br>
-util *<br>
-views *<br>
-GruntFile.js<br>
-app.js *<br>
-bower.json<br>
-package.json<br>

Now the overall concept:<br>
-views and controllers have the same folders .Views only have jade files and controllers only have javascript files that implement the logic.<br>
-models have the schemas but do not create the models themselves.<br>
-util now has the passport.js and the http500.js<br>
-configurator has the routes.js and models.js which are responsible for creating the routes and models.Important! routes.js does not work as it used to,meaning <br>that you do not have to write a long list of app.get app.post etc.(More on this later).<br>
-controllers files only have one function and are named by them so for instance account/settings/ folder has ~20 files that implement the connect with Facebook,<br>Github,Google,update etc .And they follow a certain pattern in order to be defined as routes .<br>
This pattern will be explained later.<br>

Now on more details<br>
1)In views i have removed every .js file, they are implemented in controllers now.<br>
2)Schemas now exist in the models folder with a small change.Every schema file used to have a app.db.model(model.modelName, model.schema); statement .I have <br>removed this statement from all of them and i have added two new ,1 for the description of the schema and one for the model's name.The models creation is now <br>implemented in the configurator/models.js which sole purpose is to iterate through the files of the schemas folder and create all the models.It also keeps them in<br> an array and it is able to write them to the console for debugging purposes specifying the model's name and description.<br>
3)As i said models and controllers have the exact same folders.<br>
Controllers now are splitted in many files to define different operations.For example, in the views/account/settings used to be an index.js which defined all <br>operation over the account settings eg connect with fb,google,update account,identify etc.In my implementation all this logic is moved to controllers/account/<br>settings and every function is now a file eg i have a file named connectFacebook.js,connectGithub.js,identify.js,update.js. Those files though follow a certain <br>pattern which let the configurator/routes.js define the appropriate routes and handlers.This pattern is the following:<br>
```javascript
module.exports = {
    method : "GET",
    url : ["/account/settings/facebook/"],
    desc : "get : account settings facebook connectFacebook",
    passport : {   //this is null if no passport is required
        strategy : 'facebook',
        callbackURL : "/account/settings/facebook/callback/"
    },
    handler : function(req, res,next){
        //your code here
        }
```
This is from the controllers/account/settings/connectFacebook.js<br>
As you see i export a javascript object which defines the method,the urls.the description,if passport authentication is required and the handler.<br>

Now for the routes.<br>
configurator/routes.js has an implementation of directory traversal of the controllers directory.<br>
It takes each controller one by one and requires it .By that it creates the appropriate routes .<br>
If project is on development mode it also stores them in a 'hashmap' and can output them for debugging purposes on the console and on the browser also.<br>
It gives two extra endpoints for this.<br>
-/someurl/dev<br>
--Outputs a table describing the endpoint someurl<br>
-/all/dev/<br>
--Outputs all the endpoints with tables<br>

What i think we get from this implementation:<br>
1)Project is more readable and you can understand what is going pretty fast just by looking the files/folders names<br>
2)People who create upon this do not need to define routes by themselves they just need to add their handlers under the controllers folder with the discussed <br>patern.<br>
3)They can extend the database just by adding a schema to the schemas folder.<br>
4)They get debugging sugars<br>



