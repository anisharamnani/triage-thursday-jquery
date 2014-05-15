$(document).ready(function(){
  $.fn.twitterResult = function( settings ) {
      return this.each(function() {
      var results = $( this );
      var actions = $.fn.twitterResult.actions =
        $.fn.twitterResult.actions || $.fn.twitterResult.createActions();
      var a = actions.clone().prependTo( results );
      var term = settings.term;

      results.find( "span.search_term" ).text( term );
      $.each([ "populate", "remove", "collapse", "expand" ], function( i, ev ) {
        results.on( ev, {
            term: term
        }, $.fn.twitterResult.events[ ev ] );
      });

      // use the class of each action to figure out
      // which event it will trigger on the results panel
      a.find( "li" ).click(function() {
        // pass the li that was clicked to the function
        // so it can be manipulated if needed
        results.trigger( $( this ).attr( "class" ), [ $( this ) ] );
    });
  });
};

$.fn.twitterResult.createActions = function() {
  return $( "<ul class='actions' />" ).append(
    "<li class='remove'>Remove</li>" +
    "<li class='collapse'>Collapse</li>"
  );
};

$.fn.twitterResult.events = {


  populate: function( e, json ) {
    var results = json.results;
    var elem = $( this );

    elem.find( "p.loading" ).remove();
    $.each( results, function( i, result ) {
      var meetup = "<p class= 'meetup'>" +  "<a href='" + result.event_url + "'>" + result.name + "</a>" + "</p>"
      ;

      elem.append( meetup );
    });

    // indicate that the results are done refreshing
    elem.removeClass("refreshing");
  },

  remove: function( e, force ) {
    if ( !force && !confirm( "Remove panel for term " + e.data.term + "?" ) ) {
        return;
    }
    $( this ).remove();

    // indicate that we no longer have a panel for the term
    search_terms[ e.data.term ] = 0;
  },

  collapse: function( e ) {
    $( this ).find( "li.collapse" )
    .removeClass( "collapse" )
    .addClass( "expand" )
    .text( "Expand" );

    $( this ).addClass( "collapsed" );
  },

  expand: function( e ) {
      $( this ).find( "li.expand" )
      .removeClass( "expand" )
      .addClass( "collapse" )
      .text( "Collapse" );

      $( this ).removeClass( "collapsed" );
  }

};

$( "#meetup" ).on( "getResults", function( e, term ) {
    // make sure we don't have a box for this term already
  var search_terms = [];
  if ( !search_terms[ term ] ) {
        var elem = $( this );
        var template = elem.find( "div.template" );

        // make a copy of the template div
        // and insert it as the first results box
        results = template.clone()
        .removeClass( "template" )
        .insertBefore( elem.find( "div:first" ) )
        .twitterResult({
            "term": term
        });


        search_terms[ term ] = 1;
    }
}).on( "getTrends", function( e ) {
    var elem = $( this );
    console.log(elem)
    var API = "8072676612439244c143e34301a256"
    var topic = $('#search_term').val();

    $.getJSON( "https://api.meetup.com/2/open_events?key=" + API + "&zip=" + topic +"&sign=true" + "&callback=?",
      function( json ) {
        //var results = json.results;
    	var results = new Array(10);    
	$.each( results, function( i, result ) {
       //  var meetup = "<p class= 'meetup'>" +  "<a href='" + result.event_url + "'>" + result.name + "</a>" + "</p>"
         var meetup = "<p class='meetup'><a href='#'>link" + i + "</a>"
		 elem.trigger( "getResults", [ meetup ] );
      

      elem.append( meetup );
    });

    });
});

$( "form" ).submit(function( event ) {
    var term = $( "#search_term" ).val();
    $( "#meetup" ).trigger( "getResults", [ term ] );
    event.preventDefault();
});

$( "#get_trends" ).click(function() {
    $( "#meetup" ).trigger( "getTrends" );
});
$.each([  "expand", "collapse" ], function( i, ev ) {
    $( "#" + ev ).click( function( e ) {
        $( "#meetup div.results" ).trigger( ev );
    });
});

$( "#remove" ).click(function( e ) {
    if ( confirm( "Remove all results?" ) ) {
        $( "#meetup div.results" ).trigger( "remove", [ true ] );
    }
});
});
