(function($) {

var CARD_COUNT = 52;


function move_animate(card, target, callback){
    var move = function(card, target, interval, times, move_step, callback) {
        var orig_pos = $(card).position();
        var new_left = orig_pos.left + move_step.left;
        var new_top = orig_pos.top + move_step.top;
        $(card).css('left', new_left);
        $(card).css('top', new_top);
        if (times == 1) {
            callback();
            return;
        } 

        window.setTimeout(function(){
             move(card, target, interval, times - 1, move_step, callback);
        }, interval)
    }
    var orig_style = $(card).attr('style');
    var orig_pos = $(card).offset();
    $(card).css('position', 'absolute').css('left', orig_pos.left).css('top', orig_pos.top)
    var times = 10;
    var left_len = parseInt((target.left - orig_pos.left) / times);
    var top_len = parseInt((target.top - orig_pos.top) / times);
    $(card).appendTo(document.body)
    var parent = $(card).parent();
    move(card, target, 10, times, { left : left_len, top: top_len }, function(){
        $(card).appendTo(parent);
        $(card).attr('style', orig_style);
        callback();
    });
}

function init_factory(methods) {
	return function(method) {
        if (methods[method]) {
            var args = Array.prototype.slice.call(arguments, 1);
            var result = null;
            this.each(function () {
                result = methods[method].apply(this, args);
            });
            return result;
        } else if (typeof method === 'object' || !method) {
            var args = arguments;

            return this.each(function () {
                return methods.init.apply(this, args);
            });
        } else {
            $.error('Method ' + method + ' does not exist!');
        }
	}
}
/******************************************************************************/
/**
 * Deck object
 */
(function() {

	function init() {
		var state = {
        };
        $.data(this, 'deck', state);
        var suits = $('<div id="suits" class="suits"></div>').appendTo(this);
        for (var i = 0; i < 4; i++) {
        	$('<div id="suit' + i + '" class="suit"></div>').appendTo(suits);
        	$('suit' + i).suit();
        }
        var frees = $('<div id="frees" class="frees"></div>').appendTo(this);
        for (var i = 0; i < 4; i++) {
        	$('<div id="free' + i + '" class="free"></div>').appendTo(frees);
        	$('free' + i).free();
        }
        var table = $('<div id="table"></div>').appendTo(this);
        for (var i = 0; i < 8; i++) {
        	$('<div id="column' + i + '" class="column"></div>').appendTo(table);
        	$('column' + i).column();
        }
        return this;
	}

	$.fn.deck = init_factory({ init : init });
})();

/******************************************************************************/
/**
 * Free object
 */
(function() {

	function init(od) {
		var state = {
            id    : id
        };
        $.data(this, 'free', state);
        return this;
	}

	function push(card) {
		$(card).css('padding-top', '0px')
		$(card).appendTo(this);
	}

	function empty() {
		return $(this).find('.card').length == 0;
	}

	function get_card() {
		var cs = $(this).find('.card');
		if (cs.length == 1){
			return cs.get(0);
		}
		return null;
	}
	$.fn.free = init_factory( { init : init, push : push, get_card : get_card, empty : empty } )
})();

var suits  = ['clubs', 'spades', 'hearts', 'diamonds'];
/******************************************************************************/
/**
 * Suits object
 */
(function() {

	function init() {
		var state = {
        };
        $.data(this, 'suit', state);
        return this;
	}

    function empty() {
        return $(this).find('.card').length == 0;
    }

	function push(card, animate, callback) {
        var self = this;
        if (animate == true) {
            move_animate(card, $(self).offset(), function(){
                $(self).suit('push', card);
                if (callback) callback();
            });
        }else{
            $(this).find('.card').remove();
            var card = $(card);
            $(card).attr('freeze', 'true');
    		$(this).attr('suit', card.attr('suit'));
    		$(this).attr('max_value', card.attr('value'));
    		$(card).appendTo(this);
        }
	}

    function top_card() {
        var last = $(this).find('.card').last();
        return last.attr('id') ? last.get(0) : null;
    }

	$.fn.suit = init_factory({ init : init, push : push, empty : empty, top_card : top_card })
})();

/******************************************************************************/
/**
 * Table object
 */
(function() {

	function init(id) {
		var state = {
            id : id
        };
        for(var i = 0; i < 8; i++) {
        	$('<div id="column' + i + '" class="column"></div>').appendTo(this)
        }
        $.data(this, 'table', state);

        return this;
	}
	$.fn.table = init_factory({ init : init })
})();
/******************************************************************************/
/**
 * Column object
 */
(function() {

	function init() {
		var state = {
        };
        $.data(this, 'column', state);
        return this;
	}

	function top_card() {
		var last = $(this).find('.card').last();
		return last.attr('id') ? last.get(0) : null;
	}

	function push(card) {
		var tc = top_card.apply(this);
		if (tc) {
			$(card).appendTo(tc);
		}else{
			$(card).appendTo(this);
		}
		$(card).addClass('card_on_table');
	}

	function empty() {
		return $(this).find('.card').length == 0;
	}

	$.fn.column = init_factory({ init : init, push : push, top_card : top_card, empty : empty })
})();
/******************************************************************************/

/**
 * Card object
 */
(function() {

	var suits  = ['clubs', 'spades', 'hearts', 'diamonds'];
    var values = [1, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    var colors = {'clubs': 'black',
               'spades': 'black',
               'hearts': 'red',
               'diamonds': 'red'};

	function init() {
		var id    = $(this).attr('id');
		var number = parseInt(id.replace('card', ''));
		var value = values[Math.floor((number - 1) / 4)];
		var suit  = suits[(number - 1) % 4];
		var color = colors[suit];
		var state = {
            value : value,
            color : color,
            suit  : suit
        };
        $.data(this, 'card', state);
        $(this).css('background', 'url(images/' + number + '.png) no-repeat');
        $(this).attr('number', number + "");
        $(this).attr('value', value + "");
        $(this).attr('color', color);
        $(this).attr('suit', suit);
        return this;
	}

	function nether() {
		var cs = $(this).parent('.card');
		if (cs.length == 1){
			return cs[0];
		}
		return null;
	}

	function gt(card) {
		var card_state = $.data(card, 'card');
		var this_state = $.data(this, 'card');
		return this_state.color != card_state.color && this_state.value == card_state.value + 1;
	}

	function push(card) {
		$(card).appendTo(this);
	}

	$.fn.card = init_factory({ init : init, nether : nether, gt : gt, push : push })
})()


var Game = function() {
	this.init();
};

/**
 * Initialise the game object.
 */
Game.prototype.init = function() {
	$('#deck').deck();
    this.card_ids = [];
    this.is_started = false;
    this.timer = null;
    this.time  = 0;
};

Game.prototype.ready = function() {
    $('#timer').text('00:00');
    if (this.timer != null) {
        window.clearInterval(this.timer);
    }
    this.time = 0;
    this.card_ids = [];

    $('.card').remove();
    $('.suit').attr('suit', null).attr('max_value', null);

    for (var i = 1; i <= CARD_COUNT; i++) {
        var card_id = 'card' + i;
        this.card_ids.push(card_id);
    }  

    //shuffle the cards
    for (var i = 0; i < 10 * CARD_COUNT; i++){
        var j = parseInt(Math.random() * CARD_COUNT);
        var tmp = this.card_ids[parseInt(i / 10)];
        this.card_ids[parseInt(i / 10)] = this.card_ids[j]
        this.card_ids[j] = tmp;
    }

    this.reload();
}

Game.prototype.reload = function() {
    
    for (var i = 0; i < CARD_COUNT; i++) {
        var col_index = i % 8;
        var col = $('#column' + col_index);
        var card = $('<div class="card" id="' + this.card_ids[i] + '"></div>').appendTo($('#deck'));
        card.card();
        col.column('push', card);
    }

    this.create_draggables();
}

Game.prototype.start = function() {
    this.auto_move_to_suits();
    this.is_started = true;
    var game = this;
    this.timer = window.setInterval(function(){
        game.time += 1;
        var ss = game.time % 60;
        var mm = (game.time - ss) / 60;
        if (ss < 10) ss = "0" + ss;
        if (mm < 10) mm = "0" + mm;
        $('#timer').text(mm + ":" + ss);
    }, 1000)
}

Game.prototype.get_droppable_slots = function(suit, color, value, is_stacked) {
	var slots = [];
	if (!is_stacked) {
		$('.free').each(function(){
	    	var card = $(this).free('get_card');
	    	if (card == null) {
	    		slots.push(this);
	    	}
	    });
	    $('.suit').each(function(){
	    	var suit_type = $(this).attr('suit');
	    	if (suit_type == null && value == 1) {
	    		slots.push(this);
	    	}else{
	    		var suit_max_value = parseInt($(this).attr('max_value'));
	    		if (suit_type == suit && suit_max_value == value - 1) {
	    			slots.push(this);
	    		}
	    	}
	    });
	}
    
    $('.column').each(function(){
   		var card = $(this).column('top_card');
   		if (card == null) {
   			slots.push(this);
   		}else{
	   		var c_color = $(card).attr('color');
	   		var c_value = parseInt($(card).attr('value'));
	   		if (c_color != color && c_value == value + 1) {
	   			slots.push(card);
	   		}
	   	}
   	});
	return slots;
}


Game.prototype.auto_move_to_suits = function() {
    var self = this;

    var clear_dda = function(callback){
        $('.card, .column, .free, .suit').each(function(){
            $(this).droppable('destroy');
            $(this).draggable('destroy');
        });
        // $('.card').unbind('dblclick');
        self.create_draggables();
        if (callback) callback() 
    }

    function move_card(callback) {
        if ($(this).attr('value') == '1') {
            var empty_suits = [];
            $('.suit').each(function(){
                if ($(this).suit('empty') && $(this).attr('max_value') == null) {
                    empty_suits.push(this);
                }
            });
            var suit = empty_suits.shift();
            $(suit).attr('max_value', '1')
            $(suit).suit('push', this, true, clear_dda);
        }else{
            var suit = $(this).attr('suit');
            var val = parseInt($(this).attr('value'));
            var freeze = $('.card[suit="' + suit + '"][value="' + (val - 1) + '"][freeze="true"]');

            $(freeze).parent().attr('max_value', val);
            $(freeze).parent().suit('push', this, true, clear_dda);
        };
    }

    var move_one_card = function(){
        var the_card = null;
        var minimum = self.calc_minimum();
        $('.free').each(function(){
            var card = $(this).free('get_card');
            if (card != null) {
                var value = parseInt($(card).attr('value'), 10);
                if (value == minimum) {
                    the_card = card;
                    return false;
                }
            }
        });
        $('.column').each(function(){
            var card = $(this).column('top_card');
            if (card != null) {
                var value = parseInt($(card).attr('value'), 10);
                if (value == minimum) {
                    the_card = card;
                    return false;
                }
            }
        });
        if (the_card) {
            move_card.apply(the_card, [move_one_card])
        }
    }
    move_one_card();
}

Game.prototype.calc_minimum = function() {
    var minimum = 100;
    $('.column').find('.card').each(function(){
        var val = parseInt($(this).attr('value'));
        if (val < minimum) minimum = val;
    })
    return minimum;
}

Game.prototype.get_draggable_cards = function() {
    var drag_cards = [];

    $('.free').each(function(){
    	var card = $(this).free('get_card');
    	if (card) {
    		drag_cards.push(card);
    	}
    });

    var empty_slot_count = 0;
    $('.column').each(function(){
    	if ($(this).column('empty')) {
    		empty_slot_count += 1;
    	}
    })
    $('.free').each(function(){
    	if ($(this).free('empty')) {
    		empty_slot_count += 1;
    	}
    })
   	$('.column').each(function(){
   		var card = $(this).column('top_card');
   		var layer = 0;
   		while(true) {
   			if (card == null) break;
	   		layer += 1;
	   		drag_cards.push(card);
	   		if (layer > empty_slot_count) break;
	   		var nether_card = $(card).card('nether');
	   		if ($(nether_card).card('gt', card)) {
	   			card = nether_card;
	   		}else{
	   			break;
	   		}
   		}
   	});
    return drag_cards;
}


Game.prototype.create_droppables = function(){
    
    var game = this;
    var droppers = function(event, ui) {
    	$('.card, .column, .free, .suit').each(function(){
	    	$(this).droppable('destroy');
	    });

    	var card = this;
        var drag_value = parseInt($(card).attr('value'), 10);
        var drag_color = $(card).attr('color');
        var drag_suit  = $(card).attr('suit');
        var is_stacked = $(card).find('.card').length > 0;
        var drop_slots = game.get_droppable_slots(drag_suit, drag_color, drag_value, is_stacked);
        $(drop_slots).each(function(){
            // add to array of droppables
            var slot = this;
            $(this).droppable({
                // callback for drop event
                tolerance : "pointer",
                drop: function(event, ui) {
                	var card = ui.draggable;
                    $(card).draggable('stop');
                    $(card).removeAttr('style');
                    $(card).css('background', 'url(images/' + $(card).attr('number') + '.png) no-repeat');

		            if ($(slot).hasClass('free')) {
		            	$(slot).free('push', card);
		            }
		            if ($(slot).hasClass('suit')) {
		            	$(slot).suit('push', card);
		            }
		            if ($(slot).hasClass('column')) {
		            	$(slot).column('push', card);
		            }
		            if ($(slot).hasClass('card')) {
		            	$(slot).card('push', card);
		            }
                }
            });
            $(this).droppable('enable');
        });
    };

    return droppers;
}

Game.prototype.create_draggables = function(){
	$('.card').each(function(){
		$(this).draggable('destroy');
        // $(this).unbind('dblclick');
	});
    if (this.is_started) {
        this.auto_move_to_suits();
    }
    var cards = this.get_draggable_cards();
    var game = this;

    var clear_dda = function(){
        $('.card, .column, .free, .suit').each(function(){
            $(this).droppable('destroy');
            $(this).draggable('destroy');

        });
        // $('.card').unbind('dblclick');
        game.create_draggables();
    }

    $(cards).each(function(){
    //     if ($(this).attr('value') == '1') {
    //         $(this).bind('dblclick', function(){
    //             var empty_suits = [];
    //             $('.suit').each(function(){
    //                 if ($(this).suit('empty') && $(this).attr('max_value') == null) {
    //                     empty_suits.push(this);
    //                 }
    //             });
    //             var suit = empty_suits.shift();
    //             $(suit).attr('max_value', '1')
    //             $(suit).suit('push', this, true, clear_dda);
    //         });
    //     }else{
    //         var suit = $(this).attr('suit');
    //         var val = parseInt($(this).attr('value')) - 1;
    //         var freeze = $('.card[suit="' + suit + '"][value="' + val + '"][freeze="true"]');
    //         if (freeze.length == 1) {
    //             $(this).bind('dblclick', function(){
    //                 $(freeze).parent().attr('max_value', parseInt($(this).attr('value')));
    //                 $(freeze).parent().suit('push', this, clear_dda);
    //             });
    //         }
    //     }
    	$(this).draggable({
            revert: 'invalid',
            delay : 10,
            revertDuration: 100,
            zIndex : 1001,
            start: game.create_droppables(),
            stop: game.clear_draggables()
        }); 
        $(this).draggable('enable');
    });
}

Game.prototype.clear_draggables = function(){
	var game = this;
    return function(event, ui) {
    	$('.card, .column, .free, .suit').each(function(){
	    	$(this).droppable('destroy');
	    	$(this).draggable('destroy');
	    });
        $('.card').unbind('dblclick');
	    game.create_draggables();
    };
}

var game = new Game();
game.ready();
window.setTimeout(function(){
    game.start();
}, 1000)

$('#new_game').click(function(){
    game.ready();
    window.setTimeout(function(){
        game.start();
    }, 1000)
})


$('#reload_game').click(function(){
    game.reload();
    window.setTimeout(function(){
        game.start();
    }, 1000)
})

})(jQuery);