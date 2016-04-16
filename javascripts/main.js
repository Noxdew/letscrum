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

// Animate
$(function() {
    $(document).on("scroll", onScroll);

    function onScroll() {
        var $window = $(window);
        var window_height = $window.height();
        var window_top_position = $window.scrollTop();
        var window_bottom_position = (window_top_position + window_height);
        $(".animateWhenEnter").each(function(i, element) {
            element = $(element);
            var element_height = element.outerHeight();
            var element_top_position = element.offset().top;
            var element_bottom_position = (element_top_position + element_height);

            //check to see if this current container is within viewport
            if ((element_bottom_position >= window_top_position) &&
               (element_top_position <= window_bottom_position)) {
                element.removeClass("animateWhenEnter");
                element.addClass("animated fadeInUp");
            // } else {
            //     $element.removeClass('in-view');
            }
        });
    }
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

$(function() {
    $("#menubtn").click(function(){
        $(this).toggleClass("open");
    });
});
