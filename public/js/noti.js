function noti_av_driver() {
  console.log("noti");

  if ("Notification" in window) {
    console.log("noti-call");
    // if the user grants permission, show the notification
    var notification = new Notification("Hello, World!", {
      body: "New Auto-driver Avilable!!!",
    });
  }
}
