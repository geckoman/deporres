function Main_gallery() {
  var self = this;
  
  this.thumb_holder = this.root.children('div.thumbs');
  this.basin_holder = this.root.children('div.basins');
  this.thumbs = this.thumb_holder.children().children().addClass('r_thumb');
  this.basins = this.basin_holder.children().children().addClass('r_basin');
  this.active_index = 0;
  this.thumb_drawer_open = false;
  
  this.mattes = $('div#full_screen div.matte div');
  this.matte_iter = 0;
  
  
  this.start_up = function() {
    self.basin_setup();
    self.thumbs.bind('rewidth', self.rewidth_thumbs);
    self.root.bind('click', self.click_handler);
    self.thumbs.trigger('rewidth');
    $(window).bind('resize', self.fit_full_screen);
    $(window).trigger('resize');
  }
  
  this.fit_full_screen = function() {
    var win_hei = $(window).height();
    var bod_hei = $('div#container').outerHeight(true);
    $('div#full_screen').height((bod_hei > win_hei ? bod_hei : win_hei));
  }
  
  this.basin_setup = function() {
    for (var i = 0; i < self.thumbs.length; i++) {
      if (i === self.active_index) {self.thumbs.eq(i).addClass('active'); continue}
      var new_basin = self.thumbs.eq(i).clone();
      new_basin.attr('src', new_basin.attr('src').replace('thumb', 'hallux'));
      self.basins.push(new_basin.removeClass('r_thumb').addClass('r_basin')[0]);
    }
  }
  
  this.rewidth_thumbs = function(e) {
    if (!e.currentTarget.complete) { $(e.currentTarget).bind('load', self.rewidth_thumbs); return false;}
    
    self.thumb_holder.children().width(self.thumb_holder.children().width() + $(e.currentTarget).outerWidth(true));
  }

  
  this.click_handler = function(e) {
    var me = $(e.target);
    if (me.hasClass('r_thumb')) {
      if (me.hasClass('active')) {return false;}
      self.basin_switch(me.prevAll().length);
    } else if (me.hasClass('r_basin')) {
      
    } else if (me.hasClass('r_slider')) {
      
    } else if (me.hasClass('thumbs')) {
      if (self.thumb_drawer_open) {
        self.hide_thumbs();
      } else {
        self.show_thumbs();
      }
      self.thumb_drawer_open = !self.thumb_drawer_open;
    } else if (me.hasClass('gallery')) {
      return false
    } else {
      e.target = me.parent()[0];
      self.click_handler(e)
    }
  }
  
  this.basin_switch = function(new_index) {
    var old_acitve_index = self.active_index;
    self.active_index = new_index;
    self.thumbs.eq(old_acitve_index).removeClass('active');
    self.thumbs.eq(self.active_index).addClass('active');
    /*
    self.skch(self.thumbs.eq(self.active_index), {
      opacity : 1,
      borderLeftWidth : 10,
      borderRightWidth : 10,
      marginLeft : 0,
      marginRight : 0
    }, null, .3, 'linear');
    self.skch(self.thumbs.eq(old_acitve_index), {
      opacity : .7,
      borderLeftWidth : 0,
      borderRightWidth : 0,
      marginLeft : 10,
      marginRight : 10
    }, null, .3, 'linear');
    */
    self.basin_holder.children().prepend(self.basins.eq(self.active_index).css({opacity : 0, display : 'block'}));
    self.skch(self.basins.eq(self.active_index), {opacity : 1}, function(){self.basins.eq(old_acitve_index).remove()}, .85, 'easeOutCubic');
    self.skch(self.basins.eq(old_acitve_index), {opacity : 0}, null, .3, 'easeOutQuad');
    self.matte_switch();
  }
  
  this.show_thumbs = function() {
    self.thumb_holder.css({visibility : 'hidden', height : 'auto'});
    var temp_height = self.thumb_holder.height();
    self.thumb_holder.css({visibility : 'visible', height : 10});
    
    self.skch(self.thumb_holder,{
      marginTop: -temp_height - 100,
      height: temp_height
    }, null, 1, 'easeOutQuad');
    self.skch(self.thumb_holder.children(),{
      top: 0,
    }, null, 1, 'easeOutQuad');
  }
  
  this.hide_thumbs = function() {
    self.skch(self.thumb_holder.children(),{
      top: -50
    }, null, 1, 'easeOutQuad');
    self.skch(self.thumb_holder,{
      height: 10
    }, null, 1, 'easeOutQuad');
    setTimeout(function(){
      self.skch(self.thumb_holder,{
        marginTop: -10
      }, null, .8, 'easeOutCubic');
    }, 750);
  }
  
  this.matte_switch = function() {
    self.skch(self.mattes.eq(self.matte_iter), {opacity : 0}, null, 1, 'easeOutQuad');
    self.matte_iter++;
    if (self.matte_iter >= self.mattes.length) {
      self.matte_iter = 0;
    }
    self.skch(self.mattes.eq(self.matte_iter), {opacity : 1}, null, 1.5, 'easeOutCubic');
  }
  
  return this;
}

function Contact() {
  var self = this;
  this.overlay = null;
  
  this.start_up = function() {
    self.root.bind('click', self.bring_in_form);
  }
  
  this.bring_in_form = function(e) {
    e.preventDefault();
    self.overlay = new Overlay($('div#container div#content'));
    
    
    self.skch(self.overlay, {opacity :  0.7}, null, 1.2);
    setTimeout(function(){
      self.skch(self.overlay, {height: 580}, null, 1.5, 'easeOutQuint');
    }, 250);
  }
  
  return this;
}
