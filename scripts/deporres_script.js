function Main_gallery() {
  var self = this;
  
  this.thumb_holder = this.root.children('div.thumbs');
  this.basin_holder = this.root.children('div.basins');
  this.thumbs_wrapper = self.thumb_holder.children('div.holder');
  this.thumbs = this.thumb_holder.children('div.holder').children().addClass('r_thumb');
  this.basins = this.basin_holder.children().children().addClass('r_basin');
  this.old_acitve_index = this.active_index = 0;
  this.thumb_drawer_open = false;
  this.thumb_holder_height = 0;
  this.rewidth_iter = 0;
  
  this.mattes = $('div#full_screen div.matte div');
  this.matte_iter = 0;
  this.slide_y = 0;
  this.thumb_y = 0;
  this.slide_proportion = 1;
  this.thumb_tag = self.root.children('div.expander_notifier');
  this.thumbs_slide_on = this.thumb_drawer_peaked =false;
  this.slide_direction = -1
  
  this.start_up = function() {
    self.basin_setup();
    
    self.thumbs.bind('rewidth', self.reheight_thumbs);
    self.root.bind('click', self.click_handler);
    self.root.bind('mousedown', self.mousedown_handler);
    self.root.bind('mousemove', self.mousemove_handler);
    self.root.bind('mouseleave', self.hide_strip);
    self.root.bind('mouseup', self.mouseup_handler);
    self.thumb_holder.bind('wheel', self.slide_wheel);
    $(window).bind('resize', self.fit_full_screen);
    
    self.thumbs.trigger('rewidth');
    $(window).trigger('resize');
  }
  
  this.fit_full_screen = function() {
    var win_hei = $(window).height();
    var bod_hei = $('div#container').outerHeight(true);
    $('div#full_screen').height((bod_hei > win_hei ? bod_hei : win_hei));
  }
  
  this.slide_wheel = function(e, delta) {
    e.preventDefault();
    delta = Math.floor(delta * -5);
    self.slide_y += delta;
    self.thumb_y += delta / self.slide_proportion;
    self.set_slider();
    return false;
  }
  
  this.set_slider = function() {
    if (self.slide_y < 0) {
      self.slide_y = 0;
      self.thumb_y = 0;
    } else if (self.slide_y + self.slide_height > self.root_height) {
      self.slide_y = self.root_height - self.slide_height 
      self.thumb_y = ((self.root_height - self.slide_height) / self.slide_proportion);
    }
    self.slider.css({top : self.slide_y});
    self.thumbs_wrapper.css({top : self.thumb_y * self.slide_direction});
  }
  
  this.slider_setup = function() {
    if (!self.slider) {
      self.thumb_holder.append('<div class="r_slider"></div>');
      self.slider = self.thumb_holder.children('div.r_slider');
    }
    self.root_height = self.root.height();
    self.slide_proportion = self.root_height/self.thumb_holder_height;
    self.slide_height = self.slide_proportion * self.root_height;
    self.slider.height(self.slide_height);
  }
  
  this.basin_setup = function() {
    for (var i = 0; i < self.thumbs.length; i++) {
      if (i === self.active_index) {self.thumbs.eq(i).addClass('active'); continue}
      var new_basin = self.thumbs.eq(i).clone();
      new_basin.attr('src', new_basin.attr('src').replace('thumb', 'hallux'));
      self.basins.push(new_basin.removeClass('r_thumb').addClass('r_basin')[0]);
    }
  }
  
  this.reheight_thumbs = function(e) {
    if (!e.currentTarget.complete) { $(e.currentTarget).bind('load', self.reheight_thumbs); return false;}
    self.thumb_holder_height += $(e.currentTarget).outerHeight(true);
    self.rewidth_iter++;
    if (self.rewidth_iter == self.thumbs.length) {
      self.thumbs_wrapper.height(self.thumb_holder_height);
      self.slider_setup();
    }
  }

  
  this.mousedown_handler = function(e){
    e.preventDefault();
    var me = $(e.target);
    if (me.hasClass('thumbs') || me.hasClass('r_slider') || me.hasClass('r_thumb')) {
      self.start_mouse_y = e.pageY;
      self.start_slide_y = self.slide_y;
      self.start_thumb_y = self.thumb_y;
      self.thumbs_slide_on = true;
      self.slide_direction = (me.hasClass('r_thumb') ? -1 : -1);
    } else if (me.hasClass('gallery')) {
      return false;
    } else {
      e.target = me.parent()[0];
      self.click_handler(e);
    }
    
    e.stopPropagation();
    return false;
  }
  
  this.mousemove_handler = function(e){
    e.preventDefault();
    if (self.thumbs_slide_on) {
      self.slide_y = self.start_slide_y + (e.pageY - self.start_mouse_y);
      self.thumb_y = self.start_thumb_y + ((e.pageY - self.start_mouse_y) / self.slide_proportion);
      self.set_slider();
    }
    var xactive_correct = e.pageX - self.root.offset().left;
    if (!self.thumb_drawer_open) {
      if (xactive_correct > self.root.width() * 0.75) {
        self.show_strip();
      } else {
        self.hide_strip();
      }
    }
    e.stopPropagation();    
    return false;
  }
  
  this.mouseup_handler = function(e) {
    e.preventDefault();
    self.thumbs_slide_on = false;
    
    e.stopPropagation();    
    return false;
  }
  
  this.click_handler = function(e) {
    e.preventDefault();
    var me = $(e.target);
    if (me.hasClass('r_thumb')) {
      if (me.hasClass('active')) {return false;}
      self.basin_switch(me.prevAll().length);
    } else if (me.hasClass('r_basin')) {
      var page_x_correct = e.pageX - self.root.offset().left;
      var temp_root_width = self.root.width()
      if (self.thumb_drawer_open) {
        self.hide_thumbs();
      } else if (page_x_correct > temp_root_width * 0.33) {
        self.basin_switch(self.active_index + 1);
      } else if (page_x_correct < temp_root_width * 0.33) {
        self.basin_switch(self.active_index - 1);
      }
    } else if (me.hasClass('r_slider')) {
      
    } else if (me.hasClass('thumbs')) {
      
    } else if (me.hasClass('expander_notifier')) {
      if (self.thumb_drawer_open) {
        self.hide_thumbs();
      } else {
        self.show_thumbs();
      }
    } else if (me.hasClass('gallery')) {
      return false;
    } else {
      e.target = me.parent()[0];
      self.click_handler(e);
    }
    e.stopPropagation();
    return false;
  }
  
  this.basin_switch = function(new_index) {
    if (new_index >= self.thumbs.length) {new_index = 0;}
    else if (new_index < 0) {new_index = self.thumbs.length - 1}
    self.old_acitve_index = self.active_index;
    self.active_index = new_index;
    self.thumbs.eq(self.old_acitve_index).removeClass('active');
    self.thumbs.eq(self.active_index).addClass('active');
    self.basin_holder.children().prepend(self.basins.eq(self.active_index).css({opacity : 0, display : 'block'}));
    self.basins.eq(self.active_index).bind('reloaded', self.basin_visiual_switch);
    self.basins.eq(self.active_index).trigger('reloaded');
  }
  
  this.basin_visiual_switch = function(e) {
    if (!e.currentTarget.complete) { $(e.currentTarget).bind('load', self.basin_visiual_switch); return false;}
    self.basins.eq(self.active_index).unbind();
    self.skch(self.basins.eq(self.active_index), {opacity : 1}, function(){ self.basins.eq(self.old_acitve_index).remove()}, .85, 'easeOutCubic');
    self.skch(self.basins.eq(self.old_acitve_index), {opacity : 0}, null, .3, 'easeOutQuad');
    var temp_width = self.basins.eq(self.active_index).width();
    if (temp_width != self.basins.eq(self.old_acitve_index).width()) {
      self.skch($('div#container'), {
        width : temp_width,
        marginLeft: -temp_width/2
      }, null, .4, 'easeInOutCubic');
      self.skch(self.root, {
        height : self.basins.eq(self.active_index).height()
      }, null, .3, 'easeOutQuad');
      self.slider_setup();
    }
    self.matte_switch();
  }
  
  this.show_strip = function() {
    if (self.thumb_drawer_open || self.thumb_drawer_peaked) {return false;} else {self.thumb_drawer_peaked = true;}
    self.skch(self.thumb_tag,{
      right: -30
    }, null, 1, 'easeOutQuad');
    self.skch(self.thumb_holder,{
      marginLeft: -20,
      width: 20
    }, null, 1, 'easeOutQuad');
  }
  
  this.hide_strip = function() {
    if (self.thumb_drawer_open || !self.thumb_drawer_peaked) {return false;} else {self.thumb_drawer_peaked = false;}
    self.skch(self.thumb_tag,{
      right: -8
    }, null, 1, 'easeOutQuad');
    self.skch(self.thumb_holder,{
      marginLeft: 0,
      width: 0
    }, null, 1, 'easeOutQuad');
  }
  
  this.show_thumbs = function() {
    self.thumb_holder.css({visibility : 'hidden', width : 'auto'});
    var temp_width = self.thumb_holder.width();
    self.thumb_holder.css({visibility : 'visible', width : 10});
    self.skch(self.thumb_tag,{
      backgroundPosition: '-37px 0',
      right: -42
    }, null, 1, 'easeInOutQuad');
    
    self.skch(self.thumb_holder,{
      marginLeft: -temp_width,
      width: temp_width
    }, null, 1, 'easeInOutQuad');
    self.skch(self.thumbs_wrapper,{
      left: 0,
    }, null, 1, 'easeInOutQuad');
    self.skch(self.slider,{
      right: 8.5,
    }, null, 1, 'easeInOutQuad');
    self.thumb_drawer_open = !self.thumb_drawer_open;
  }
  
  this.hide_thumbs = function() {
    self.skch(self.thumb_tag,{
      backgroundPosition: '0px 0'
    }, function() {
      self.skch(self.thumb_tag,{
        right: -8
      }, null, 1, 'easeOutQuad');
    }, .5, 'easeOutQuad');
    self.skch(self.thumbs_wrapper,{
      left: -70
    }, null, 1, 'easeOutQuad');
    self.skch(self.slider,{
      right: -40
    }, null, 1, 'easeOutQuad');
    self.skch(self.thumb_holder,{
      width: 0
    }, null, 1, 'easeOutQuad');
    setTimeout(function(){
      self.skch(self.thumb_holder,{
        marginleft: -10
      }, null, .75, 'easeOutCubic');
    }, 750);
    self.thumb_drawer_open = !self.thumb_drawer_open;
  }
  
  this.matte_switch = function() {
    self.skch(self.mattes.eq(self.matte_iter), {opacity : 0}, null, 1, 'easeOutQuad');
    self.matte_iter++;
    if (self.matte_iter >= self.mattes.length) {
      self.matte_iter = 0;
    }
    self.skch(self.mattes.eq(self.matte_iter), {opacity : 1}, null, 1.5, 'easeOutQuad');
  }
  
  return this;
}

function Contact() {
  var self = this;
  this.overlay = null;
  this.form_in = false;
  this.popin = null;
  
  this.start_up = function() {
    self.root.bind('click', self.get_page);
  }
  
  this.get_page = function(e) {
    if (self.form_in) {return false;} else {self.form_in = true;}
    e.preventDefault();
    $.ajax({
      url: self.root.attr("href"),
      type: "GET",
      async: false,
      success: self.bring_in_form
    });
    $.getScript('http://www.google.com/jsapi', self.initiate_blog);
  }
  
  this.grab_post = function(blog) {
    self.recent_post = blog.feed.getEntries().slice(0,2);
    
    var new_post_string = '<hr />';
    self.local_post = new Array();
    for (var i = 0; i < self.recent_post.length; i++) {
      self.local_post[i] = {
        title : self.recent_post[i].getTitle().getText(),
        summary : self.recent_post[i].getSummary().getText(),
        link : self.recent_post[i].getHtmlLink().getHref(),
        date : self.recent_post[i].getPublished().getValue().getDate()
      }

      new_post_string += '<div class="post">';
      new_post_string += '<h3><a href="' + self.local_post[i].link + '">' + self.local_post[i].title + '</a></h3>';
      new_post_string += '<h5>' + self.local_post[i].date.toLocaleDateString() + '</h5>';
      new_post_string += '<p>' + self.local_post[i].summary + '<a href="' + self.local_post[i].link + '">... read more </a></p>';
      new_post_string += '</div>';
    }

    self.popin.children('div.body').append(new_post_string);

  }
  
  this.error_grab_post = function(error) {
    alert(error);
  }
  
  this.get_blog = function() {
    self.blog_url = 'http://danieldeporres.blogspot.com/feeds/posts/default';
    self.blogger_service = new google.gdata.blogger.BloggerService('danieldeporres.net');
    self.blogger_service.getBlogFeed(self.blog_url, self.grab_post, self.error_grab_post);
  }
  
  this.initiate_blog = function() {
    google.load("gdata", "1.x", {"callback" : self.get_blog});
  }
  this.bring_in_form = function(data) {
    var popin_container = $('div#jax_container')
    self.overlay = new Overlay(popin_container);
    popin_container.append('<div class="popin">' + data + '</div>');
    self.popin = popin_container.children('div.popin');
    
    self.skch(self.overlay, {opacity :  0.2}, null, 1.2);
    setTimeout(function(){
      var width_diff = (popin_container.width() - $('div#container').width()) * .5;
      self.overlay.children().css({left : self.root.position().left - self.overlay.children().width() - 15 + width_diff});
      self.skch($('div.gallery'), {opacity :  0}, null, 1.5, 'easeOutQuad');
      self.skch(self.overlay, {height: 620}, function() {
        self.skch(self.overlay.children(), {top: 593}, null, 1.25, 'easeOutQuad');
        self.skch(self.root, {paddingRight: 10}, null, 1.25, 'easeOutQuad');
        self.skch(self.popin, {opacity :  1}, null, .3, 'easeOutQuad');
        
      }, 1.5, 'easeOutQuint');
    }, 250);
    
    self.overlay.children().andSelf().bind('click', function() {
      self.skch(self.root, {paddingRight: 0}, null, .4, 'easeOutQuad');
      self.skch($('div.gallery'), {opacity :  1}, function() {self.form_in = false;}, .75, 'easeOutQuad');
      self.skch(self.popin);
    });
  }
  
  return this;
}
