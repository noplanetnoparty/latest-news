$.getJSON("/articles", function(data) {
    for (var i = 0; i < data.length; i++) {
      $("#articleDiv").append("<p data-id='" + data[i]._id + "'><strong>" + data[i].title + "</strong><br />" + data[i].link + "</p>");
    }
  });
  

  $(document).on("click", "p", function() {
    $("#noteDiv").empty();
    var thisId = $(this).attr("data-id");
  
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      .then(function(data) {
        console.log(data);
        $("#noteDiv").append("<h2>" + data.title + "</h2>");
        $("#noteDiv").append("<input id='titleinput' name='title' >");
        $("#noteDiv").append("<textarea id='bodyinput' name='body'></textarea>");
        $("#noteDiv").append("<button data-id='" + data._id + "' id='savenote'>Save Comment</button>");
  
        if (data.note) {
          $("#titleinput").val(data.note.title);
          $("#bodyinput").val(data.note.body);
        }
      });
  });
  

  $(document).on("click", "#savenote", function() {
    var thisId = $(this).attr("data-id");
  
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val()
      }
    })
    // With that done
    .then(function(data) {
        console.log(data);
        $("#noteDiv").empty();
      });
  
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });