/* ------------------------- Introduction -------------------------
  Copyright (c) 2009 Mark Avery. Copious Inc. -- copiousinc.com --
  
  ther are two different 'acts', load_acts, and jax_acts
  load_acts are the functions to be called upon a 'load' action
  jax_acts are to be called upon an 'jax' action
  for the different 'acts' they take 3 paramaters..
  
  item : the jQuery selector being passed to the function
  handle : the fuction to be called
  extras : any additional argument to be passed as an array
  
  this.start_up() initiates the controler.. and will be called upon instantiation.. of all classes.
  
*/

function Introduction(element){
  Controler.call(this, element);
  var self = this;
  this.live_site = 'http://www.danieldeporres.net';
  
  this.linker_force = [{
    hookshot : /^\/contact/i,
    handle : Contact
  }]
 
  this.scenes = [];
 
  this.acts = [{
    item : this.container.find('div#content.home div.gallery'),
    handle : Main_gallery
  }];
 return this;
}

$(document).ready(function() {
  new Introduction($('#container')).start_up();
});
