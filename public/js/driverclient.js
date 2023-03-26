$("#event-form").submit(function (event) {
  event.preventDefault();
  const formData = $(this).serialize();
  $.post("/admin/event", formData, function (response) {
    console.log(response);
    // Update the events on the homepage without refreshing
    $.get("/student/homepage", function (html) {
      const newEvents = $(html).find("#events").html();
      $("#events").html(newEvents);
    });
  });
});
