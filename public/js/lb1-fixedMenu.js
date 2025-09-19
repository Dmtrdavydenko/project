const menu = document.querySelector(".menu");
const distance = document.querySelector(".menu").getBoundingClientRect();
let copy = new Object();
let etop = distance.top + window.pageYOffset;
window.addEventListener('scroll', function() {
console.log(pageYOffset,etop);
	if ( pageYOffset > etop )
	{
        if(!copy.tagName){
        copy = document.querySelector(".menu").cloneNode(true);
        document.body.append(copy);
        menu.style.visibility = "hidden";
        copy.style.position = "fixed";
        copy.style.top = "0px";
        copy.style.left = distance.left+"px";
        copy.style.background = "transparent";
        copy.style.backdropFilter = "blur(3px)";
        }

	}else{
        menu.style.visibility = "visible";
        if(copy.tagName)
		copy.remove();
        copy = {};
    }

    if(copy.tagName){
    if ( pageYOffset < etop )
	{
        //if(copy.tagName){
        //menu.style.visibility = "visible";
		copy.remove();
        //copy = {};
	}
    }
});









/*
$(window).on('scroll', function() {
        if ($(window).scrollTop() > 166) {
            $('.fixed-header').show();
        } else {
            $('.fixed-header').hide();
        }
    });
*/