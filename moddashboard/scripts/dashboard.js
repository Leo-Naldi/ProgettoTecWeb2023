$(function () {
    // Handle tab clicks
    $(".nav-link").click(function () {
        // Remove the 'active' class from all tabs
        $(".nav-link").removeClass("active");
        // Add the 'active' class to the clicked tab
        $(this).addClass("active");

        // Hide all content sections
        $(".content").removeClass("active-content");

        // Show the corresponding content section based on the clicked tab
        var tabId = $(this).attr("id").replace("Tab", "Content");
        $("#" + tabId).addClass("active-content");
    });
});