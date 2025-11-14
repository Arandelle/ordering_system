$(document).ready(function(){


    // Attach click event to all menu links
    $('.nav_link-6').on('click', function(event) {
        event.preventDefault();

        const menuClass = $(this).data('menu'); // Get the menu name directly

        if (menuClass) {
            showMenu(menuClass);
        } else {
            console.warn('Missing data-menu attribute for this link.');
        }
    });


    // Function to show the correct menu
    function showMenu(menuClass) {
        let navigationMenu = $('.div-block-128');
        // Hide all menus
        $('.rice, .noodles, .stuffed, .soup, .breakfast, .mealstogo, .combomeals, .desserts, .coffee, .sodas, .ads, .sisig, .chicken, .pork, .alcodrinks, .vegie, .addons' ).css({
            display: 'none',
            opacity: '0'
        });
        navigationMenu.css('display','none');

        // Show the selected menu
        const selectedMenu = $('.' + menuClass);
        if (selectedMenu.length) {
            selectedMenu.css({
                display: 'block',
                opacity: '1'
            });
        } else {
            console.warn('No element found for menu:', menuClass);
        }
    } 


    
    $('.sectors__link-5').on('click', function(event) {
        

        const mainMenuClass = $(this).data('menu'); // Get the menu name directly

        if (mainMenuClass) {
            showMainMenu(mainMenuClass);
        } else {
            console.warn('Missing data-menu attribute for this link.');
        }
    });


    // Function to show the correct menu
    function showMainMenu(mainMenuClass) {
        let navigationMenu = $('.div-block-128');
        // Hide all menus
        $('.mealstogo, .combomeals' ).css({
            display: 'none',
            opacity: '0'
        });
        navigationMenu.css('display','none');

        // Show the selected menu
        const selectedMainMenu = $('.' + mainMenuClass);
        if (selectedMainMenu.length) {
            selectedMainMenu.css({
                display: 'block',
                opacity: '1'
            });
        } else {
            console.warn('No element found for menu:', mainMenuClass);
        }
    } 


    const firstLink = $(".sectors__link-5").first();
    if (firstLink.length) {
        firstLink.addClass("current");
    }


}); 




