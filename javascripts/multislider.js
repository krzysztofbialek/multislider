(function ( $ ) {

  $.fn.multislider = function(options) {
    var sliders_container = this;
    var sliders_count = options.sliders_count 
    var total = 100;
    var sliders = new Sliders();
    sliders.init(sliders_count, this)

    return this;
    
  };
  
  Sliders = function(){ 
    var sliders = []
    var self = this
    var percentages = []
    self.init = function (sliders_count, container){
      for(var i = 0; i < sliders_count; i++) { 
        slider = $("<div class='slider slider_" + (i + 1) + "'></div>")
        sliders[i] = slider.slider({min: 0, max: 100, step: sliders_count - 1, value: 0});
        container.append(slider)
      }
      bind_sliders(sliders)
      self.init_percentages(sliders_count);
    }    
    //bind all different fields to appropriate methods
    bind_sliders = function(sliders){
      $.each(sliders, function(i, slider){
       slider.on( "slide", function(event, ui) { self.update(ui, slider) } );
      })
    }

    //count change in percent on slider move and adjust other sliders
    self.update = function(ui, slider){
      index_of_slider = _.indexOf(sliders, slider);
      var old_percent = percentages[index_of_slider]
      var new_percent = ui.value;
      var diff = Math.abs(old_percent - new_percent)
      percentages[index_of_slider] = new_percent;
      if(old_percent < new_percent){
        self.decrease_sliders(slider, diff);
      } else {
        self.increase_sliders(slider, diff);
      }

      self.updateSlidersByPercent();
      console.log(percentages)
    }

    self.increase_sliders = function(active_slider, diff){
      var new_percentages = _.without([0,1,2,3], _.indexOf(sliders, active_slider));
      var sticky_0_slider = _.filter(new_percentages, function(num){
        return percentages[num] === 0;
      }); 
      console.log(sticky_0_slider) 
      if(sticky_0_slider.length > 0){
        $.each(new_percentages, function(i, item){
          if(!$.inArray(item, sticky_0_slider)){
            percentages[item] += diff;
          }
        });
      }else{
        $.each(new_percentages, function(i, item){
          percentages[item] += i
        });
      };
    }

    self.decrease_sliders = function(active_slider, diff){
      sliders_to_update = _.without(sliders, active_slider);
      var new_percentages = _.without([0,1,2,3], _.indexOf(sliders, active_slider));
      
      $.each(new_percentages, function(i, item){
        percentages[item] -= diff / (sliders.length -1 );
      });
     
      var percent_below_0 = _.filter(new_percentages, function(num){
        return percentages[num] < 0;
      });
     
      var percent_above_0 = _.without(new_percentages, percent_below_0[0]);
    
      console.log(percent_below_0) 
      if(percent_below_0.length === 1){
        new_diff = Math.abs(percentages[percent_below_0]);
        percentages[percent_below_0] = 0;
        percentages[percent_above_0] -= new_diff;
      }
    }
    
    self.init_percentages = function(count){
      _(count).times(function(n) {
        percentages[n] = sliders[n].slider("option", "value");
        console.log(percentages)
      });
    }
  
    //update UI after slider settings are changed
    //default step is 2 to make it possible in this place to change it to 1 and adjust both sliders.
    //withouth doing this plugin is rounding anythin smaller than step to it's value.
    self.updateSlidersByPercent = function(){
      $.each(sliders, function(index, item){
        item.slider('option', 'step', 1);
        item.slider('value', percentages[index]);
        item.slider('option', 'step', sliders.length - 1);
        //item.slider('option', 'step', 2);
      }); 
    }
  };
} ( jQuery ));
