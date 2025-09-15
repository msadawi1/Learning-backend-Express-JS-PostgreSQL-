const sidebar = $(".sidebar");

function showSideBar() {
    sidebar.css("display", "flex");
}

function hideSideBar() {
    sidebar.fadeOut(200);
}

$('#opn-menu-btn').on('click', function () {
    showSideBar();
});

$('#cls-menu-btn').on('click', function () {
    hideSideBar();
});

$("main").on("click", () => {
    if (sidebar.css("display") === "flex") {
        hideSideBar();
    }
})

$(document).on("keypress", (event) => {
    if (event.key === "Enter")
        $("input[type='submit']").click();
});
