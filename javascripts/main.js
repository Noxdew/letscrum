// Section size adjustment
$(function() {
    var sections = $(".fill-screen");
    function updateScreenHeight() {
        var screenHeight = window.innerHeight;
        sections.each(function(i, sec) {
            $(sec).css("min-height", screenHeight - 50 + "px");
        });
    }

    updateScreenHeight();
    window.dispatchEvent(new Event("resize"));
    window.addEventListener("resize", updateScreenHeight);
});

// Scroll
$(function() {
    $(document).on("scroll", onScroll);

    //smoothscroll
    $('a[href^="#"]').on("click", function (e) {
        e.preventDefault();
        $(document).off("scroll");

        $("a").each(function () {
            $(this).removeClass("active");
        });
        $(this).addClass("active");

        var target = this.hash;
        var menu = target;
        $target = $(target);
        $("html, body").stop().animate({
            "scrollTop": $target.offset().top - 50
        }, 500, "swing", function () {
            // window.location.hash = target;
            $(document).on("scroll", onScroll);
        });
    });

    function onScroll(event){
        var scrollPos = $(document).scrollTop();
        $(".navbar a").each(function() {
            var currLink = $(this);
            var refElement = "";
            try {
                refElement = $(currLink.attr("href"));
            } catch(ex) {
                return;
            }

            if (refElement.position().top <= scrollPos + 50 && refElement.position().top + refElement.height() > scrollPos + 50) {
                $(".navbar a").each(function(i, link) {
                    link = $(link);
                    if (link.attr("href") != currLink.attr("href")) {
                        link.removeClass("active");
                    }
                });
                currLink.addClass("active");
            } else {
                currLink.removeClass("active");
            }
        });
    }
});
