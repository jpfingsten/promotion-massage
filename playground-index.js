var drawerOptions = {},
    drawer = new dat.GUI(),
    offerTemplateList = [],
    viewCheckmark,
    offerSelect


// we use the library DatGUI.js to behave like a Mocksite drawer
// see https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage

// drawer defaults
drawer.close()

// AMTRAK ONLY: Update the caret image source for doc downloads to add "/"
function updateAMTCaretSrc(html) {
    // If the path name contains "amt" (i.e. it's in the Amtrak playground)...
    if (document.location.pathname.includes('amt')) {
        // Add "/" to the beginning of each caret image source
        html = html.replaceAll('src="./content', 'src="/content');
    }
    return html;
}

// Create the button to download the setup file for the selected offer
drawerOptions.DownloadSetup = function () {
  // Create an "a" tag
  var a = document.createElement('a');

  // Clone the entire document element
  var docNodeClone = document.documentElement.cloneNode(true);
  // Set the cloned document element's ID as "docClone"
  docNodeClone.id = 'docClone';

  // Get the hidden "div" tag with ID "allianz-docDownload"
  var hiddenContainer = document.getElementById('allianz-docDownload');
  // Add the cloned document element as the child of the hidden "div" tag
  hiddenContainer.appendChild(docNodeClone);

  // Remove the drawer from the cloned document element
  document.querySelector('#docClone .dg.ac').remove();

  // Get the template elements from the cloned document element
  var templates = document.querySelectorAll('#docClone template');

  // Loop through the templates
  for (let i = 0; i < templates.length; i++) {
    // Remove the templates from the cloned document element
    templates[i].remove();
  }

  // Get the full web page view container element from the cloned document element
  var webPageViewContainer = document.querySelector('#docClone .showOnWebPageView');

  // If the full web page view container element exists...
  if (webPageViewContainer != null) {
    webPageViewContainer.remove();
  }

  // Get the cloned document element's outer HTML as a string & remove the "\" (escape character) from the start of each double quote
  var fileContent = docNodeClone.outerHTML.replaceAll('\"', '"');
  // Remove the cloned document element from the playground page
  docNodeClone.remove();
  // Get the hostname & directory path of the playground page & remove the page name from the end
  var path = document.URL.slice(0, document.URL.lastIndexOf('/') + 1);
  // Replace all relative link & source references in the new HTML with absolute link references (mainly for external stylesheets)
  fileContent = fileContent.replaceAll('href=\"./', 'href=\"' + path);
  fileContent = fileContent.replaceAll('src=\"./', 'src=\"' + path);
  // Set the new HTML as the "href" value of the new "a" tag
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContent);
  // Get the "select" tag from the "ActiveOffer" dropdown
  var selectOpts = document.querySelector('.dg.ac select');
  // Get the value from the selected "option" tag & add " - Setup.html" to the end (this will be the name of the downloaded file)
  var fileName = selectOpts.options[selectOpts.selectedIndex].text + ' - Setup.html';
  // Set the "a" tag's "download" attribute to the file name created earlier
  a.setAttribute('download', fileName);
  // Simulate a click on the "a" tag to start the download
  a.click();
};

// Add the button to download the setup file to the drawer
var setupDownloadBtn = drawer.add(drawerOptions, 'DownloadSetup');

// FUNCTION: Left-align the HTML (i.e. remove leading tabs)
// Param - "html": The original HTML string
function trimHtml(html) {
  // Split up the original HTML string by line breaks into an array of strings
  var htmlArray = html.split('\n');

  // Initialize an empty string to hold the new left-aligned HTML string
  var formattedHtml = '';

  // Loop through the array
  for (let i = 0; i < htmlArray.length; i++) {
    // Add the trimmed string and a line break to the end of the new left-aligned HTML string
    formattedHtml = formattedHtml + htmlArray[i].trim() + '\n';
  }

  // Return the new left-aligned HTML string
  return formattedHtml;
}

// Create the button to download the seeding file for the selected offer
drawerOptions.DownloadSeeding = function () {
  // Create an "a" tag
  var a = document.createElement('a');

  // Get the visible offer element
  var offerElement = document.querySelector('.hideOnWebPageView .agaTemplateContainer');

  // Get the visible offer's HTML
  var offerHTML = offerElement.outerHTML;

  // Get the "select" tag from the "ActiveOffer" dropdown
  var selectOpts = document.querySelector('.dg.ac select');

  // Get the value from the selected "option" tag & format it as an HTML comment (this will be the first line in the downloaded file)
  var selectedOfferName = selectOpts.options[selectOpts.selectedIndex].text;

  // Create a string for the template name (template from Core) comment that's just a new line
  var templateName = '\n';

  // Get the comment containing the offer template name (template from Core)

  // Create an iterator to go through all of the offer comments
  var iterator = document.createNodeIterator(offerElement, NodeFilter.SHOW_COMMENT);

  // Initialize a variable for the current node
  var currentNode;

  // Loop through the comments
  while (currentNode = iterator.nextNode()) {
    // If the comment starts with " Template: "...
    if (currentNode.nodeValue.startsWith(' Template: ')) {
      // Make the template name string an HTML comment with two lines below it
      templateName = '<!--' + currentNode.nodeValue + '-->\n\n';
      // Break the loop
      break;
    }
  }
  // If there aren't any comments with the template (from Core) name, then the template name string is just a new line

  // Create a string that will contain all of the seeding doc HTML, beginning with the offer name comment and template (from Core) name comment, if there's one
  var fileContent = '<!-- ' + selectedOfferName + ' -->\n' + templateName;

  // Initialize a variable to contain the component seeding HTML string
  var componentSeeding;

  // Initialize a variable for a regular expression that indicates the seeding comment is the beginning of the seeding (ex. "Seeding - INTRO") instead of the end of the seeding (ex. "Seeding - /INTRO")
  var regEx = /^- (?!\/)/;

  // Break up the offer HTML into separate strings in an array split up at the beginning and ending seeding comments
  var componentSections = offerHTML.split('<!-- Seeding ');

  // Loop through the array
  for (let i = 0; i < componentSections.length; i++) {
    // If the array item is a beginning seeding comment (i.e. starts with a letter after the " - " and not a "/")...
    if (componentSections[i].match(regEx)) {
      // Make the component seeding this string from the array (add "<!-" to the beginning of the string to make the component name a comment)
      componentSeeding = '<!-' + componentSections[i];
      // Add the new component seeding to the end of the existing file content string and add multiple line breaks
      fileContent = fileContent + componentSeeding + '\n\n\n\n';
    }
  }

  // Left-align all the HTML (i.e. remove leading tabs)
  fileContent = trimHtml(fileContent);

  // Update the caret image sources (AMTRAK ONLY)
  fileContent = updateAMTCaretSrc(fileContent);

  // Set the new HTML as the "href" value of the new "a" tag
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContent);

  // Get the value from the selected "option" tag & add " - Seeding.html" to the end (this will be the name of the downloaded file)
  var fileName = selectedOfferName + ' - Seeding.html';

  // Set the "a" tag's "download" attribute to the file name created earlier
  a.setAttribute('download', fileName);

  // Simulate a click on the "a" tag to start the download
  a.click();
};

// Add the button to download the seeding file to the drawer
var seedingDownloadBtn = drawer.add(drawerOptions, 'DownloadSeeding');


drawerOptions.WebPageView = false;

// Add the option to toggle our webpage view on or off.
viewCheckmark = drawer.add(drawerOptions, 'WebPageView');
viewCheckmark.onFinishChange(function(boolValue) {
    $('.showOnWebPageView').toggle()
    $('.hideOnWebPageView').toggle()
  
    // Scroll down to the offer that is visible (after a small wait)
    if (boolValue){
        $(window).scrollTop( $('.agaTemplateContainer:visible').offset().top - 100 )
    }
});


// Custom JavaScript to take the <template> contents and insert it into the Mock Webpage
var insertOfferIntoPage = function(dataTitle) {
  var template = $('template[data-title="' + dataTitle + '"]')[0],
      insertionAreas = $('.agaTemplateContainer'),
      template10 = $('.allianz-template10')

  // append a copy of the <template> to an isolated div and a 
  insertionAreas.each( function(){
    this.innerHTML = ''
    this.appendChild(document.importNode(template.content, true))
  })

  if ($('.agaTemplateContainer .allianz-template10').length > 0) {
    $('#insurance-header').html('Add Event Ticket Protection');
  } else {
    $('#insurance-header').html('Ticket Insurance');
  }
};

// For multiple <templates>, populate a list of of them by thier data-titles and create a dropdown menu in our drawer
$('template').each(function(){ offerTemplateList.push($(this).data('title')) })

// set our default drawer setting
drawerOptions.ActiveOffer = offerTemplateList[0]
// add it to our drawer and save it for event listening
offerSelect = drawer.add(drawerOptions, 'ActiveOffer', offerTemplateList)
// the event listener when the select changes
offerSelect.onFinishChange(insertOfferIntoPage)



// Save the Select Element (dropDown) as a variable to be used later // 
var dropDownData = document.querySelector(".string .c select");
// Listen for event changes on the Select Element
dropDownData.addEventListener("change", function() {
// Save the currently active offers Data Title in Session Storage
  sessionStorage.setItem("autosave", dropDownData.value);
});


// Stuff to do when everything loads.
$(window).on('load',function(){  

  // See if we have an autosave value
  // (this will only happen if the page is accidentally refreshed)
  if (sessionStorage.getItem("autosave")) {
    // Get the Data Title that has been saved in storage
    sessionDataTitle = sessionStorage.getItem("autosave");
    // Set the Select Element value to the saved Data Title
    dropDownData.value = sessionDataTitle;
     // Restore the contents of the last offer using Data Title
    insertOfferIntoPage(sessionDataTitle);
  } else {
    insertOfferIntoPage(offerTemplateList[0]);
  }
})