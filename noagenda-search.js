// made for No Agenda

function getExcerptAroundKeyword( fullText, keyword )
{
	// strip HTML codes - just in case, not sure it's needed
	// not needed as $(this).text() for <li> used so it's done automatically 

	// find only excerpt around keyword
	var keywordPos = fullText.toUpperCase().indexOf ( keyword.toUpperCase() );
	if (keywordPos == -1)
	{ return fullText; }
	var radius = 50;
	if (fullText.length < radius)
	{ return fullText; }
	var excerptStart = keywordPos - radius;
	var excerptEnd = keywordPos + keyword.length + radius;
	if (excerptStart < 0) { excerptStart = 0; } 
	if (excerptEnd > fullText.length) { excerptEnd = fullText.length; } 
	var excerpt = fullText.substring( excerptStart, excerptEnd);
	return excerpt;
}


function repositionSearchResults()
{
 var naInput 	= $(".pageSearch");
 var naOffset	= naInput.offset();
 var naDim	= {
	left:		naOffset.left, 
	top:		naOffset.top, 
	width:		naInput.outerWidth(), 
	height:		naInput.outerHeight()
 };
 naDim.topPos		= naDim.top + naDim.height;
 var borderWidth = 3;
 naDim.totalWidth	= naDim.width - borderWidth; 
 $("#searchResults").css({
		position:	'absolute', 
		background:	'#fff',
		padding		: "5px",
		"border-style"	: 'solid',
		"border-width"	: '5px',
		"border-radius"	: '7px',
		"border-color"	: '#4387fd',
		left:		naDim.left + 'px', 
		top:		naDim.topPos + 'px',
		width:		naDim.totalWidth + 'px'
 });
}

// adds input field and binds to change event
function addNoAgendaSearch()
{
 var searchHTML = "<li><span class='pageSearch'>"+
	" | On-page Search: <input class='searchInput'>"+
	"</span></li>";
 $("a:contains('Search')").parent().append(searchHTML);
 $(".pageSearch").parent().css("display","inline");
 // prepare search results drop down
 var searchResults = $("<div id='searchResults'>search results</div>").appendTo(document.body).hide();
 repositionSearchResults();

 // dynamic behavior 
 $(".pageSearch").keyup( function() 
 { 
	noAgendaSearchKeyup(); 
 });
 $(document).off("click", ".showInOutline");
 $(document).on("click", ".showInOutline", function() 
 {
	var clickedIndex = $(this).data("index");
 	var searchText = $(".searchInput").val();
	var foundLI = $($("li.outline:contains('"+searchText+"')")[clickedIndex]);
	if (currentFoundLI) // hide previous selection
	{
		$(currentFoundLI).parent().parent().parent().parent().addClass("collapsed");
		$(currentFoundLI).parent().parent().addClass("collapsed");
	}
	currentFoundLI = foundLI;
	$(foundLI).parent().parent().parent().parent().removeClass("collapsed");
	$(foundLI).parent().parent().removeClass("collapsed");
	$(".highlight").removeClass("highlight");
        $(foundLI).parent().parent().highlight(searchText);
	/* searching in clips tab */
	if (! $(".highlight").is(":visible"))  //  not visible?
	{
		if ($("#tabclips-and-stuff").find(".highlight").length > 0) // in clips tab?
		{
			$("a:contains('Clips and Stuff')").click(); // switch to clips tab!
			currentFoundLI = null;// don't add collapsed as problems arise then
		}
	}
	/* */
	var offsetToHighlight = $(foundLI).find(".highlight").offset().top;
	$("#searchResults").hide();
	$('html,body').animate({
	   scrollTop: (offsetToHighlight - $("div.navbar").height())
	   //was good but not good enough:
           //scrollTop: $($(".highlight")[0]).offset().top - $("div.navbar").height()
	});
 });
 // close searchResults DIV when clicking outside it
 jQuery(document.body).click(function(event) {
    var clickedObject = jQuery(event.target);

    if (!(clickedObject.is('#searchResults' ) || 
          clickedObject.parents('#searchResults' ).length || 
	  clickedObject.is('input'))) 
    { $("#searchResults").hide(); }
 });
 $(document).off("click", ".closeButton");
 $(document).on("click", ".closeButton", function() 
 { $(this).parent().hide(); });

 noAgendaSearchInitialized = true;
}

var currentFoundLI = null;


// displays dropdown with search results
function noAgendaSearchKeyup()
{
 var closeButton = "<span class='closeButton' style='cursor: pointer; float: right; color: red; font-weight: bold;'>(X)</span>";
 if ($(".searchInput").val().length < 3)
 { // to prevent too many results
 	 $("#searchResults").html(closeButton+ "please enter at least 3 characters");
	 repositionSearchResults();
	 $("#searchResults").show();
	return; 
 }
 var timeStamp = "( time stamp = "+(new Date())+")";
 var searchResultCount = $("li.outline:contains('"+$(".searchInput").val()+"')").length;
 var resultsText = "results";
 if (searchResultCount == 1) { resultsText = "result"; }
 $("#searchResults").html(
	closeButton+ " found " + searchResultCount
	+ " "+ resultsText + " in show notes on this page ");
 var searchText = $(".searchInput").val();
 var searchResultIndex = 0;
 $("li.outline:contains('"+searchText+"')").each( function () 
 { 
	var foundText =  $(this).text();
	foundText = getExcerptAroundKeyword(foundText, searchText);
	$("#searchResults").append("<hr><span class='excerpt'>"+ foundText + "</span>"+
	"<br><span data-index='"+searchResultIndex+"'"+ 
	" class='showInOutline' style='cursor: pointer; float:right; color: #1a0dab; font-weight: bold;'>show in outline...</span>" );
	searchResultIndex++;
 });
 repositionSearchResults();
 $(".excerpt").highlight(searchText);
 $("#searchResults").show();
 $("hr").css("background-color", "grey");
 $(".naFound").css("background-color","yellow");
 $("hr").css("height", "3px");
}

var noAgendaSearchInitialized = false;


function definePlugins()
{
// 2 jQuery plugins and extensions here, no biggy

// plugin 1
// NEW selector
jQuery.expr[':'].Contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};

// OVERWRITES old selecor
jQuery.expr[':'].contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};

// plugin 2
// tiny plugin for HIGHLIGHTING from https://github.com/bartaz/sandbox.js/blob/master/jquery.highlight.js : 

jQuery.extend({
    highlight: function (node, re, nodeName, className) {
        if (node.nodeType === 3) {
            var match = node.data.match(re);
            if (match) {
                var highlight = document.createElement(nodeName || 'span');
                highlight.className = className || 'highlight';
                var wordNode = node.splitText(match.index);
                wordNode.splitText(match[0].length);
                var wordClone = wordNode.cloneNode(true);
                highlight.appendChild(wordClone);
                wordNode.parentNode.replaceChild(highlight, wordNode);
                return 1; //skip added node in parent
            }
        } else if ((node.nodeType === 1 && node.childNodes) && // only element nodes that have children
                !/(script|style)/i.test(node.tagName) && // ignore script and style nodes
                !(node.tagName === nodeName.toUpperCase() && node.className === className)) { // skip if already highlighted
            for (var i = 0; i < node.childNodes.length; i++) {
                i += jQuery.highlight(node.childNodes[i], re, nodeName, className);
            }
        }
        return 0;
    }
});

jQuery.fn.unhighlight = function (options) {
    var settings = { className: 'highlight', element: 'span' };
    jQuery.extend(settings, options);

    return this.find(settings.element + "." + settings.className).each(function () {
        var parent = this.parentNode;
        parent.replaceChild(this.firstChild, this);
        parent.normalize();
    }).end();
};

jQuery.fn.highlight = function (words, options) {
    var settings = { className: 'highlight', element: 'span', caseSensitive: false, wordsOnly: false };
    jQuery.extend(settings, options);
    
    if (words.constructor === String) {
        words = [words];
    }
    words = jQuery.grep(words, function(word, i){
      return word != '';
    });
    words = jQuery.map(words, function(word, i) {
      return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    });
    if (words.length == 0) { return this; };

    var flag = settings.caseSensitive ? "" : "i";
    var pattern = "(" + words.join("|") + ")";
    if (settings.wordsOnly) {
        pattern = "\\b" + pattern + "\\b";
    }
    var re = new RegExp(pattern, flag);
    
    return this.each(function () {
        jQuery.highlight(this, re, settings.element, settings.className);
    });
};

}

// will be used when this JavaScript file will be included in the page
$( document ).ready(function() 
{
 definePlugins();
 addNoAgendaSearch();
 // just for testing - shows "Shownotes" tab upon loading 
 // setTimeout( function() { $($(".nav-tabs > li")[3]).find("a").click(); }, 500);
});

