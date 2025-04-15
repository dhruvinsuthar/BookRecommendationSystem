let text = document.getElementById('text');
let book1 = document.getElementById('book1');
let book2 = document.getElementById('book2');
let book3 = document.getElementById('book3');
let book4 = document.getElementById('book4');
let preveiwContainer = document.querySelector('.products-preview');
let previewBox = preveiwContainer.querySelectorAll('.preview');


const ratingElements = document.querySelectorAll('.ratings');

ratingElements.forEach(ratingElement => {
    const ratingValue = parseFloat(ratingElement.textContent); 
    const roundedRating = Math.round(ratingValue * 100) / 100;
    ratingElement.textContent = roundedRating.toFixed(2); 
});



document.querySelectorAll('.card').forEach((product, index) => {

    product.onclick = () => {
        preveiwContainer.style.display = 'flex';

        let name = product.getAttribute('data-name');
        previewBox.forEach(preview =>{
        let target = preview.getAttribute('data-target');
        if(name == target){
            preview.classList.add('active');
      }
    });
  };
});

previewBox.forEach(close => {
    close.querySelector('.fa-times').onclick = () => {
        close.classList.remove('active');
        preveiwContainer.style.display = 'none';
    };
});



window.addEventListener('scroll',() => {
    let value = window.scrollY;

    text.style.marginTop = value * 1 + 'px';
    book1.style.left = value * -3 + 'px';
    book2.style.left = value * 3 + 'px';
    book3.style.left = value * -1 + 'px';
    book4.style.left = value * 1 + 'px';

});






$(document).on('click', '.recommend-btn', function() {
    var bookTitle = $(this).data('title');
    
    $.ajax({
        type: 'POST',
        url: '/rerecommend',
        data: { user_input: bookTitle },dataType: 'json',
        success: function(data) {
            if (typeof data === 'object' && data !== null) {
                $('.recommendations').empty();
                $('.recommendations').css('display', 'block');
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        var item = data[key];
                        for (var i = 0; i < item.length; i++) {
                            $('.recommendations').append('<div class="card recommendation" style="padding:0;" data-name="' + item[i][0] + '">' + 
                                '<img src="' + item[i][2] + '" class="recommendation-img">' +
                                '<h3 style="color:black; font-weight: 500;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">' + item[i][0] + '</h3>' +
                                '</div>');
                                $('.products-preview').append('<div class="preview" data-target="' + item[i][0] + '">' +
                                '<img class="bgpreview" src="' + item[i][2] + '">' +
                                '<i class="fas fa-times"></i>' +
                                '<img class="img" src="' + item[i][2] + '" alt="">' +
                                '<div class="book-info">' +
                                '<h1>' + item[i][0] + '</h1>' +
                                '<h3>By - ' + item[i][1] + '</h3>' +
                                '<div class="rates">' +
                                '<span class="fa fa-star checked"></span>' +
                                '<h5 class="ratings">' + Math.round(item[i][3] * 100) / 100 + '</h5>' + 
                                '</div>' +
                                '<p class="isbnno">ISBN -</p>' +
                                '<p class="isbn_number">' + item[i][4] + '</p>' +
                                '<p class="publisher">Publisher : </p>'+
                                '<p class="date">Published Date : </p>' +
                                '<p class="page_count">Pages : </p>' +
                                '<p class="genre">Genre :</p>' +
                                '<a href="https://www.amazon.in/s?k=' + item[i][0] + '+' + item[i][1] + '&i=stripbooks" class="buy-now-link" target="_blank">Amazon Link</a>' +
                                '<button class="recommend-btn" data-title="' + item[i][0] + '">Recommend more</button>' +
                                '</div>' +
                                '<h4>Description :</h4>' +
                                '<p class="description"></p><br><br>' +
                                '<h4>About the Author :</h4>' +
                                '<div class="author_info">' +
                                '<img class="author_image">' +
                                '<p class="author_description"></p>' +
                                '</div><br>' +
                                '<div class="recommendations" id="recommendationsContainer"></div>' +
                                '</div>');}}}

                                $(document).on('click', '.card', function() {
                                    const dataName = $(this).attr('data-name');
                                    
                                    console.log('Clicked card with data-name:', dataName);
                                    
                                    const previewDiv = $('.preview[data-target="' + dataName + '"]');
                                    if (previewDiv.length > 0) {
                                        const isbn = previewDiv.find('.isbn_number').text();
                                        fetchBookDetails(isbn, previewDiv);
                                    } else {
                                        console.error(`Preview not found for data-name: ${dataName}`);
                                    }
                                });
                                
                                
                                function fetchBookDetails(isbn, previewDiv) {
                                    const apiKey = '#######################';
                                    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${apiKey}`;
                                
                                    fetch(apiUrl)
                                        .then(response => response.json())
                                        .then(data => {
                                            if (data.items && data.items.length > 0) {
                                                const volumeInfo = data.items[0].volumeInfo;
                                                const description = volumeInfo.description || 'Book Description Not Found!';
                                                const pageCount = volumeInfo.pageCount || 'N/A';
                                                const pdate = volumeInfo.publishedDate || 'N/A';
                                                const authors = volumeInfo.authors && volumeInfo.authors.length > 0 ? volumeInfo.authors[0] : 'N/A';
                                                const imageUrl = volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : 'N/A';
                                                const averageRating = volumeInfo.averageRating || 'N/A';
                                                const publisher = volumeInfo.publisher || 'N/A' 

                                                previewDiv.find('.description').text(description);
                                                previewDiv.find('.page_count').text('Pages : ' + pageCount);
                                                previewDiv.find('.date').text('Published Date : ' + pdate);
                                                previewDiv.find('.genre').text('Genre : ' + (volumeInfo.categories ? volumeInfo.categories.join(', ') : 'N/A'));
                                                previewDiv.find('.publisher').text('Publisher : ' + publisher);
                                                
                                                fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${authors}`)
                                                    .then(response => response.json())
                                                    .then(wikiData => {
                                                        if (wikiData.thumbnail && wikiData.thumbnail.source) {
                                                            const authorImageUrl = wikiData.thumbnail.source;
                                                            previewDiv.find('.author_image').attr('src', authorImageUrl);
                                                        } else {
                                                            previewDiv.find('.author_image').attr('src', '/static/images/noprofile.png');
                                                        }
                                                        if (wikiData.extract) {
                                                            const authorDescription = wikiData.extract;
                                                            previewDiv.find('.author_description').text(authorDescription);
                                                        } else {
                                                            previewDiv.find('.author_description').text('Author Description: N/A');
                                                        }
                                                    })

                                                if (imageUrl !== 'N/A') {
                                                    previewDiv.find('.img').attr('src', imageUrl);
                                                    previewDiv.find('.bgpreview').attr('src', imageUrl);
                                                } else {
                                                    const imageFromDB = previewDiv.find('.img').attr('src');
                                                    previewDiv.find('.img').attr('src', imageFromDB);
                                                    previewDiv.find('.bgpreview').attr('src', imageFromDB);
                                                }

                                                if (volumeInfo.hasOwnProperty('averageRating')) {
                                                    previewDiv.find('.ratings').text(averageRating);
                                                } else {
                                                    const ratingFromDB = parseFloat(previewDiv.find('.ratings').text());
                                                    previewDiv.find('.ratings').text(ratingFromDB);
                                                }

                                            } else {
                                                previewDiv.find('.description').text("Book Details Not Found!!");
                                            }
                                        })
                                        .catch(error => console.error('Error fetching book details:', error));}
                                
                                
  
                        
                    
                
            } else {
                console.error('Data is not an object (dictionary):', data);
            }
        }
    });
    $(document).on('click', '.fa-times', function(event) {
        if ($(event.target).hasClass('recommendation-img')) {
            $(this).closest('.preview').remove();
            $(this).closest('.preview').remove();
            $(this).closest('.preview').remove(); 
        } else {
            
            $(this).closest('.preview').remove(); 
            $(this).closest('.preview').remove(); 
            $(this).closest('.preview').remove(); 
        }
    });
    
});
    

$(document).on('click', '.recommendation-img', function() {
    const newPreviewName = $(this).closest('.recommendation').data('name');
    const previews = $('.preview').filter(function() {
        return $(this).data('target') === newPreviewName;
    });
    if (previews.length > 0) {
        $('.preview').removeClass('active');
        previews.addClass('active');
        $('.products-preview').show();
        $('.recommendations').empty();
    } else {
        console.error('Preview not found for recommendation:', newPreviewName);
    }
});

$(document).on('click', '.fa-times', function() {
    $('.products-preview').hide(); 
});
$(document).on('click', '.fa-times', function() {
    $('.recommendations').css('display', 'none'); 
});



function fetchBookDetails(isbn, previewDiv) {
    const apiKey = '##########################';
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const volumeInfo = data.items[0].volumeInfo;
                const description = volumeInfo.description || 'Book description not found!';
                const pageCount = volumeInfo.pageCount || 'N/A';
                const publishedDate = volumeInfo.publishedDate || 'N/A';
                const authors = volumeInfo.authors && volumeInfo.authors.length > 0 ? volumeInfo.authors[0] : 'N/A';
                const genre = volumeInfo.categories ? volumeInfo.categories.join(', ') : 'N/A';
                const imageUrl = volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : 'N/A';
                const averageRating = volumeInfo.averageRating || 'N/A';
                const publisher = volumeInfo.publisher || 'N/A';

                previewDiv.querySelector('.description').textContent = description;
                previewDiv.querySelector('.page_count').textContent = 'Pages : ' + pageCount;
                previewDiv.querySelector('.date').textContent = 'Published Date : ' + publishedDate;
                previewDiv.querySelector('.genre').textContent = 'Genre : ' + genre;
                previewDiv.querySelector('.publisher').textContent = 'Publisher : ' + publisher;

                fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${authors.toLowerCase().replace(/(?:^|\s)\w/g, match => match.toUpperCase())}`)
                    .then(response => response.json())
                    .then(wikiData => {
                        if (wikiData.thumbnail && wikiData.thumbnail.source) {
                            const authorImageUrl = wikiData.thumbnail.source;
                            previewDiv.querySelector('.author_image').src = authorImageUrl;
                        } else {
                            previewDiv.querySelector('.author_image').src = '/static/images/noprofile.png';   
                        }
                        if(wikiData.extract){
                            const authorDescription = wikiData.extract || 'N/A';
                            previewDiv.querySelector('.author_description').textContent = authorDescription;
                        }
                        else{
                            previewDiv.querySelector('.author_description').textContent = 'Author Description: N/A';
                        }
                    })
                    .catch(error => {
                        console.error('Error :', error);
                    });

                if (volumeInfo.hasOwnProperty('imageLinks') && volumeInfo.imageLinks.thumbnail !== 'N/A') {
                    previewDiv.querySelector('.img').src = imageUrl;
                    previewDiv.querySelector('.bgpreview').src = imageUrl;
                } else {
                    const imageFromDB = previewDiv.querySelector('.img').src;
                    previewDiv.querySelector('.img').src = imageFromDB;
                    previewDiv.querySelector('.bgpreview').src = imageFromDB;
                }
                
                if (volumeInfo.hasOwnProperty('averageRating')) {
                    previewDiv.querySelector('.ratings').textContent =averageRating;
                } else {
                    const ratingFromDB = parseFloat(previewDiv.querySelector('.ratings').textContent);
                    previewDiv.querySelector('.ratings').textContent =ratingFromDB;
                }
            }
            else {
                previewDiv.querySelector('.description').textContent = 'Book details not found.';
            }
        })
        .catch(error => console.error('Error fetching book details:', error));
}









document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function() {
        const dataName = card.getAttribute('data-name');
        
        console.log('Clicked card with data-name:', dataName);
        
        const previewDiv = document.querySelector(`.preview[data-target="${dataName}"]`);
        if (previewDiv) {
            const isbn = previewDiv.querySelector('.isbn_number').textContent;
            fetchBookDetails(isbn, previewDiv);
        } else {
            console.error(`Preview not found for data-name: ${dataName}`);
        }
    });
});

