

$.getJSON("/articles", function (data) {
    // $("#loading").hide();
    console.log(data);
    $("#articles").show();

    // For each one
    for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        $("#articles").append("<div class='card'><div class='card-body'><a class='title-link' href='" + data[i].completeLink + "'><h5>" + data[i].title + "</h5></a><hr><p class='card-text'>" + data[i].summary + "</p><button id='saveArticle' data-id='" + data[i]._id + "' class='btn btn-outline-primary btn-sm'>Save Article</button></div></div>"

        )

    }
});

//conduct a new scrape 
$(document).on("click", ".scrapeArticles", function () {
    alert("No new articles found.")
    $.ajax({
        method: "GET",
        url: "/scrape",
    })
        .done(function (dataOne, response) {
            if (response === "")
                location.reload();
        });

});

//Save an Article by clicking saveArticle button
$(document).on("click", "#saveArticle", function () {
    // $(this).addClass("disabled");
    var thisId = $(this).attr("data-id");
    console.log(thisId);

    $.ajax({
        method: "PUT",
        url: "/saved/" + thisId,
        success: function (savedData) {
            console.log(savedData);

            //Trying to change colour of the save button after successfully saving it to db
            // if (savedData.isSaved === true){
            //     console.log("saved:" + savedData.isSaved);
            //         // $("#saveArticle").removeclass("btn btn-outline-primary btn-sm");
            //     // $("#saveArticle").addClass("btn btn-success");
            //         $("#saveArticle").text("Saved!");
            //         

            //     }
        }
    })
        .done(function (data) {

            // console.log(data);
            // $(this).css('background-color', 'lightseagreen')
            // $(this).css('border', 'none')
        });
});



