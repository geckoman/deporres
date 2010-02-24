function Main_gallery() {
  var self = this;
  
  this.thumb_holder = this.root.children('div.thumbs');
  this.basin_holder = this.root.children('div.basins');
  this.thumbs_wrapper = self.thumb_holder.children('div.holder');
  this.thumbs = this.thumb_holder.children('div.holder').children().addClass('r_thumb');
  this.basins = this.basin_holder.children().children().addClass('r_basin');
  this.category_wrapper = this.root.children('div.categories').children();
  this.old_acitve_index = this.active_index = 0;
  this.thumb_drawer_open = false;
  this.thumb_holder_height = 0;
  this.rewidth_iter = 0;
  
  this.matte_elems = $('div#full_screen div.matte div');
  this.matte_iter = 0;
  this.slide_y = 0;
  this.thumb_y = 0;
  this.slide_proportion = 1;
  this.thumb_tag = self.root.children('div.expander_notifier');
  this.thumbs_slide_on = this.thumb_drawer_peaked =false;
  this.slide_direction = -1;
  
  this.active_category_name = "fashion 1";
  this.gallery = new Object();
  
  this.start_up = function() {
    $.ajax({
      url : '/gallery.json',
      dataType : 'json',
      success : self.make_gallery,
      error : function(a, b, c) {
        console.log(a,b,c)
      }
    });
    $(window).load(function() {
      self.skch(self.thumb_tag,{
        right: -25
      }, function() {
        self.skch(self.thumb_tag,{
          right: -8
        }, null, .75, 'easeInQuad');
      }, 1.3, 'easeOutQuad');
    });
  }
  
  this.root_bindup = function() {
    self.root.bind('click', self.click_handler);
    self.root.bind('mousedown', self.mousedown_handler);
    self.root.bind('mousemove', self.mousemove_handler);
    self.root.bind('mouseup', self.mouseup_handler);
    self.root.bind('mouseleave', self.hide_strip);
    $(window).bind('resize', self.fit_full_screen);
    $(window).trigger('resize');
  }
  
  this.make_gallery = function(data, textStatus, XMLHttpRequest) {
    for (var i = 0; i < data.gallery_items.length; i++) {
      if (!self.gallery[data.gallery_items[i].category]) {self.gallery[data.gallery_items[i].category] = new Array();}
      var temp_item = new Object();
      temp_item.thumb = new Image();
      temp_item.thumb.src = "/images/gallery/" + data.gallery_items[i].category + "/thumbs/" + data.gallery_items[i].image;
      temp_item.thumb.alt = data.gallery_items[i].title;
      temp_item.hallux = '<img src="/images/gallery/' + data.gallery_items[i].category + "/main/" + data.gallery_items[i].image + '" alt="' + data.gallery_items[i].title + '" />'
      self.gallery[data.gallery_items[i].category].push(temp_item);
    }
    self.mattes = new Object();
    for (var j = 0; j < data.backgrounds.length; j++) {
      if (!self.mattes[data.backgrounds[j].category]) {self.mattes[data.backgrounds[j].category] = new Array();}
      var temp_matte = '<div style="';
      if (data.backgrounds[j].image) {
        temp_matte += 'background-image:url(/images/matte/' + data.backgrounds[j].image + ');';
        temp_matte += 'background-position:' + data.backgrounds[j].position + ';';
      }
      temp_matte += 'background-color:' + data.backgrounds[j].back_color + ';';
      temp_matte += '"></div>';
      self.mattes[data.backgrounds[j].category].push(temp_matte);
    }
    self.thumb_setup();
    self.category_setup();
    
    self.matte_setup();
  }
  
  this.set_category = function(new_category_name) {
    if (self.active_category_name == new_category_name) {return false;}
    self.active_category_name = new_category_name;
    self.thumb_setup();
    self.matte_setup();
  }
  this.category_setup = function() {
    var item = null;
    for (item in self.gallery) {
      self.category_wrapper.append('<div class="item" title="' + item + '"></div>');
      var temp_html_item = self.category_wrapper.children(':last');
      for (var i = 0; i < self.gallery[item].length; i++) {
        var temp_img = new Image();
        temp_img.src = self.gallery[item][i].thumb.src;
        temp_img.alt = self.gallery[item][i].thumb.alt;
        if (item == self.active_category_name) (temp_html_item.addClass('active'))
        temp_html_item.append(temp_img);
      }
    }
  }
  
  this.thumb_setup = function() {
    self.thumbs_wrapper.html(self.gallery[self.active_category_name][0].thumb);
    for (var i = 1; i < self.gallery[self.active_category_name].length; i++) {
      self.thumbs_wrapper.append(self.gallery[self.active_category_name][i].thumb);
    }
    self.thumbs = self.thumbs_wrapper.children().addClass('r_thumb');
    self.thumb_holder.bind('wheel', self.slide_wheel);
    self.thumb_holder_height = 0;
    self.rewidth_iter = 0;
    self.thumbs.bind('rewidth', self.reheight_thumbs);
    self.thumbs.trigger('rewidth');
  }
  
  this.reheight_thumbs = function(e) {
    if (!e.currentTarget.complete) { $(e.currentTarget).bind('load', self.reheight_thumbs); return false;}
    self.thumb_holder_height += $(e.currentTarget).outerHeight(true);
    self.rewidth_iter++;
    if (self.rewidth_iter == self.thumbs.length) {
      self.thumbs.unbind();
      self.thumbs_wrapper.height(self.thumb_holder_height);
      self.basin_setup();
      self.slide_y = 0;
      self.thumb_y = 0;
      self.slider_setup();
      self.set_slider();
    }
  }

  this.basin_setup = function() {
    self.basins = $();
    for (var i = 0; i < self.thumbs.length; i++) {
      var new_basin = self.thumbs.eq(i).clone().removeClass('r_thumb');
      new_basin.attr('src', new_basin.attr('src').replace('/thumbs/', '/main/'));
      if (self.thumbs.eq(i).height() > 100 && i+1 < self.thumbs.length && !self.thumbs.eq(i).attr('src').match(/portraits/)) {
        new_basin = new_basin.wrap('<div></div>').parent();
        if (self.thumbs.eq(i + 1).height() > 100) {
          new_next_basin = self.thumbs.eq(i + 1).clone().removeClass('r_thumb');
          new_next_basin.attr('src', new_next_basin.attr('src').replace('/thumbs/', '/main/'));
          new_basin.append(new_next_basin);
        } else {
          new_next_basin = self.thumbs.eq(i - 1).clone().removeClass('r_thumb');
          new_next_basin.attr('src', new_next_basin.attr('src').replace('/thumbs/', '/main/'));
          new_basin.append(new_next_basin);
        }
      }
      self.basins.push(new_basin.addClass('r_basin')[0]);
    }
    self.basins.push(self.basin_holder.children().children()[0]);
    self.active_index = self.basins.length - 1;
    self.root_bindup();
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
      self.mousedown_handler(e);
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
    var me = $(e.target);
    if (me.hasClass('item') || me.parent().hasClass('item')) {
      if (!me.hasClass('item')) {me = me.parent();}
      var active_scrub_int = Math.floor(( (e.pageX - me.offset().left) / me.width() ) * me.children().length);
      me.children().removeClass('active_scrub').eq(active_scrub_int).addClass('active_scrub');
    }
    var xactive_correct = e.pageX - self.root.offset().left;
    var temp_root_width = self.root.width();
    if (!self.thumb_drawer_open) {
      if (xactive_correct > temp_root_width * 0.85) {
        self.show_strip();
      } else {
        self.hide_strip();
      }
    }
    if ((xactive_correct > temp_root_width * 0.33) && (!self.basin_holder.hasClass('right_arrow'))) {
      self.basin_holder.removeClass('left_arrow').addClass('right_arrow')
    } else if ((xactive_correct < temp_root_width * 0.33) && (!self.basin_holder.hasClass('left_arrow'))) {
      self.basin_holder.addClass('left_arrow').removeClass('right_arrow')
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
      var temp_root_width = self.root.width();
      var change = (me.children().length > 0 && self.basins.eq(self.active_index + 1).children().length > 0 ? 2 : 1);
      if (page_x_correct > temp_root_width * 0.33) {
        self.basin_switch(self.active_index + change);
      } else if (page_x_correct < temp_root_width * 0.33) {
        self.basin_switch(self.active_index - change);
      }
    } else if (me.hasClass('r_slider')) {
      
    } else if (me.hasClass('item')) {
      me.addClass('active').siblings().removeClass('active');
      self.set_category(me.attr('title'));
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
    self.basin_holder.children().prepend(self.basins.eq(self.active_index).css({opacity : 0, display : 'block'}));
    self.basins.eq(self.active_index).bind('reloaded', self.basin_visiual_switch);
    self.basins.eq(self.active_index).trigger('reloaded');
  }
  
  this.basin_visiual_switch = function(e) {
    var me = $(e.currentTarget);
    if(me.is('img')) {
      if (!me[0].complete) {
        me.bind('load', self.basin_visiual_switch);
        return false;
      }
    } else if (!me.children()[0].complete) {
      me.children().eq(0).bind('load', self.basin_visiual_switch); 
      return false;
    } else if (!me.children()[1].complete) {
      me.children().eq(1).bind('load', self.basin_visiual_switch); 
      return false;
    }
    self.thumbs.eq(self.old_acitve_index).removeClass('active');
    self.thumbs.eq(self.active_index).addClass('active');
    self.basins.eq(self.active_index).children().andSelf().unbind();
    self.hide_thumbs();
    self.skch(self.basins.eq(self.active_index), {opacity : 1}, function(){self.basins.eq(self.active_index).siblings().remove();}, .85, 'easeOutCubic');
    self.skch(self.basins.eq(self.old_acitve_index), {opacity : 0}, null, .3, 'easeOutQuad');
    var temp_width = self.basins.eq(self.active_index).width();
    if (temp_width != self.basin_holder.width()) {
      self.skch($('div#container'), {
        width : temp_width,
        marginLeft: -temp_width/2
      }, null, .4, 'easeInOutCubic');
      self.skch(self.root, {
        height : self.basins.eq(self.active_index).height()
      }, null, .3, 'easeOutQuad');
    }
    //self.slider_setup();
    self.matte_switch();
  }
  
  this.show_strip = function() {
    if (self.thumb_drawer_open || self.thumb_drawer_peaked) {return false;} else {
      self.thumb_drawer_peaked = true;
      self.thumb_drawer_open = false;
    }
    self.skch(self.thumb_tag,{
      right: -30
    }, null, 1, 'easeOutQuad');
    self.skch(self.thumb_holder,{
      marginLeft: -20,
      width: 20
    }, null, 1, 'easeOutQuad');
  }
  
  this.hide_strip = function() {
    if (self.thumb_drawer_open || !self.thumb_drawer_peaked) {return false;} else {
      self.thumb_drawer_peaked = false;
      self.thumb_drawer_open = false;
    }
    self.skch(self.thumb_tag,{
      right: -8
    }, null, 1, 'easeOutQuad');
    self.skch(self.thumb_holder,{
      marginLeft: 0,
      width: 0
    }, null, 1, 'easeOutQuad');
  }
  
  this.show_thumbs = function() {
    if (self.thumb_drawer_open || !self.thumb_drawer_peaked) {return false;} else {
      self.thumb_drawer_peaked = false;
      self.thumb_drawer_open = true;
    }
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
    
    self.skch(self.category_wrapper.parent(),{
      marginRight: -temp_width,
      width: temp_width
    }, null, 1, 'easeInOutQuad');
    self.skch(self.category_wrapper,{
      left: 0,
    }, null, 1, 'easeInOutQuad');
    
    
    self.skch(self.slider,{
      right: 8.5,
    }, null, 1, 'easeInOutQuad');
  }
  
  this.hide_thumbs = function() {
    if (!self.thumb_drawer_open && self.thumb_drawer_peaked) {return false;} else {
      self.thumb_drawer_peaked = false;
      self.thumb_drawer_open = false;
    }
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
    
    self.skch(self.category_wrapper.parent(),{
      width: 0
    }, null, 1, 'easeOutQuad');
    self.skch(self.category_wrapper,{
      left: -70
    }, null, 1, 'easeOutQuad');
    
    setTimeout(function(){
      self.skch(self.thumb_holder,{
        marginleft: -10
      }, null, .75, 'easeOutCubic');
      
      self.skch(self.category_wrapper.parent(),{
        marginRight: -10
      }, null, .75, 'easeOutCubic');
    }, 750);
  }
  this.matte_setup = function() {
    self.matte_elems.eq(self.matte_iter).siblings().remove();
    for (var i = 0; i < self.mattes[self.active_category_name].length; i++) {
      self.matte_elems.parent().append(self.mattes[self.active_category_name][i]);
    }
    self.matte_elems = self.matte_elems.parent().children();
    self.matte_iter = 0;
  }
  this.matte_switch = function() {
    self.skch(self.matte_elems.eq(self.matte_iter), {opacity : 0}, null, 1, 'easeOutQuad');
    self.matte_iter++;
    if (self.matte_iter >= self.matte_elems.length) {
      self.matte_iter = 1;
    }
    var temp_class_name = self.matte_elems.eq(self.matte_iter).css('background-color').toString();
    $('div#jax_container').attr('class', temp_class_name);
    self.skch(self.matte_elems.eq(self.matte_iter), {opacity : 1}, null, 1.5, 'easeOutQuad');
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
        self.skch(self.overlay.children(), {top: 588}, null, 1.25, 'easeOutQuad');
        self.skch(self.root, {paddingRight: 10}, function() {
          self.overlay.bind('click', self.remove_form);
        }, 1.25, 'easeOutQuad');
        self.skch(self.popin, {opacity :  1}, null, .3, 'easeOutQuad');
      }, 1.5, 'easeOutQuint');
    }, 250);  
  }
  
  this.remove_form = function(e) {
    self.overlay.unbind('click', self.remove_form);
    e.stopPropagation();
    e.preventDefault();
    self.skch(self.root, {paddingRight: 0}, null, .4, 'easeOutQuad');
    self.skch($('div.gallery'), {opacity :  1}, function() {self.form_in = false;}, .75, 'easeOutQuad');
    self.skch(self.popin);
    self.skch(self.overlay);
  }
  
  return this;
}
