// /****************************************************
//  * You can use client side scripts by placing them in 
//  * the public/scripts folder. They can then be linked
//  * to your EJS files and used there.
//  ****************************************************/

var counter = 1;

var limit = 8;

function addInput(divName){

    alert("You made it into this function.")

     if (counter == limit)  {

          alert("You have reached the limit of adding " + counter + " inputs");

     }

     else {

          var newdiv = document.createElement('div');

          newdiv.innerHTML = "Entry " + (counter + 1) + " <br><input type='text' name='ingredents[]>";

          document.getElementById(divName).appendChild(newdiv);

          counter++;

     }

}

// function work() {
//     alert("This worked.")
// }