$("#noMoreSaved").hide();
$.getJSON("/saved", function (data) {
  for (var i = 0; i < data.length; i++) {

    $("#see-saved-articles").append(
      "<div style='margin-bottom:60px;'><div class='card'><div class='card-body'><div class='card-title'><a class='title-link' target='_blank' href='https://www.thestar.com" + data[i].link + "'><h5>" + data[i].title + "</h5></a></div><hr><p class='card-text'>" + data[i].summary + "</p><button id='addNote' data-id='" + data[i]._id + "' class='btn-note btn btn-outline-primary'>Article Notes</button><button id='btn-delete' data-id='" + data[i]._id + "' class='btn btn-outline-primary'>Delete From Saved</button></div></div></div>"
    );
  }

  console.log(data);
});

// Whenever someone clicks a p tag
$(document).on("click", "#addNote", function () {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    .then(function (data) {
      console.log(data);
      $("#notes").append("<div class='card'><div class='card-header'><h2>" + data.title + "</h2></div><div class='card-body'><input id='titleinput' name='title' placeholder='Note Title'><br><textarea id='bodyinput' name='body' placeholder='Write Note Here'></textarea></div><div class='card-footer'><button data-id='" + data._id + "' id='savenote'>Save Note</button></div></div>")


      // If there's a note in the article
      if (data.note) {
        $("#titleinput").val(data.note.title);
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {

  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      
      title: $("#titleinput").val(),
    
      body: $("#bodyinput").val()
    }
  })
    
    .then(function (data) {
      console.log(data);
      $("#notes").empty();
    });

  
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

//Delete a saved article
$(document).on("click", "#btn-delete", function () {
  var thisId = $(this).attr("data-id");
  console.log(thisId);

  $.ajax({
    method: "PUT",
    url: "/delete/" + thisId,

  })

    .done(function (data) {
      console.log(data);
      location.reload();
    });
});

$(document).on("click", ".clearAll", function () {
  sessionStorage.reloadAfterPageLoad = true;
  window.location.reload();
  $.ajax({
    method: "DELETE",
    url: "/delete",
  })
  .then(function () {
    console.log("deleted");
    //to show the div containing the message after page reloads. doesn't work
    if (sessionStorage.reloadAfterPageLoad) {
      $("#noMoreSaved").show();
        sessionStorage.reloadAfterPageLoad = false;
      }

    })
})

 

