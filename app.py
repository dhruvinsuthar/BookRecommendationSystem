from flask import Flask,render_template,request,jsonify
import pickle
import numpy as np
import requests

popular_df = pickle.load(open('popular.pkl','rb'))
pt = pickle.load(open('pt.pkl','rb'))
books = pickle.load(open('books.pkl','rb'))
similarity_scores = pickle.load(open('similarity_scores.pkl','rb'))
test = pickle.load(open('test.pkl','rb'))
avg_rating_df = pickle.load(open('avg_rating_df.pkl', 'rb'))

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html',
                           book_name=list(popular_df['Book-Title'].values),
                           author=list(popular_df['Book-Author'].values),
                           image=list(popular_df['Image-URL-M'].values),
                           votes=list(popular_df['num-ratings'].values),
                           ratings=list(popular_df['avg-ratings'].values),
                           isbn_numbers = [books.loc[books['Book-Title'] == title, 'ISBN'].values[0] for title in popular_df['Book-Title']])

@app.route('/recommend')
def recommend_ui():
    return render_template('recommend.html')

@app.route('/recommend_books',methods=['POST'])
def recommend():
    user_input = request.form.get('user_input')
    if user_input in test['Book-Title'].values:
        index = np.where(pt.index == user_input)[0][0]
        similar_items = sorted(list(enumerate(similarity_scores[index])), key=lambda x: x[1], reverse=True)[0:11]

        data = []
        for i in similar_items:
            item = []
            print(pt.index[i[0]])
            temp_df = books[books['Book-Title'] == pt.index[i[0]]]
            item.extend(list(temp_df.drop_duplicates('Book-Title')['Book-Title'].values))
            item.extend(list(temp_df.drop_duplicates('Book-Title')['Book-Author'].values))
            item.extend(list(temp_df.drop_duplicates('Book-Title')['Image-URL-M'].values))
            avg_ratings = avg_rating_df.loc[avg_rating_df['Book-Title'] == pt.index[i[0]], 'avg-ratings'].values[0]

            isbn_number = temp_df.drop_duplicates('Book-Title')['ISBN'].values[0]
            item.append(avg_ratings)
            item.append(isbn_number)

            data.append(item)
        similar_books_found = True
    else:
        api_url = f'https://www.googleapis.com/books/v1/volumes?q=intitle:{user_input}&maxResults=11'
        response = requests.get(api_url)
        if response.status_code == 200:
            data = response.json()
            if 'items' in data:
                results = []
                for item in data['items']:
                    volume_info = item.get('volumeInfo', {})
                    title = volume_info.get('title', 'N/A')
                    authors = volume_info.get('authors', ['N/A'])
                    authors = authors[0] if authors else 'N/A'

                    image_url = volume_info['imageLinks']['thumbnail'] if 'imageLinks' in volume_info else '/static/images/defaultbook.jpg'
                    avg_rating = volume_info.get('averageRating', 'N/A')
                    identifiers = volume_info.get('industryIdentifiers', [])
                    isbn_10 = next((identifier['identifier'] for identifier in identifiers if identifier.get('type') == 'ISBN_10'), None)
                    other_identifier = next((identifier['identifier'] for identifier in identifiers if identifier.get('type') == 'OTHER'), None)
                    isbn_number = isbn_10 if isbn_10 else other_identifier

                    results.append([title, authors, image_url, avg_rating, isbn_number])
                return render_template('recommend.html', data=results, similar_books_found=False, user_input=user_input)
            else:
                return render_template('recommend.html', data=None, similar_books_found=False, user_input=user_input)
        else:
            return render_template('recommend.html', data=None, similar_books_found=False, user_input=user_input)
    
    return render_template('recommend.html', data=data, similar_books_found=True, user_input=user_input)

@app.route('/rerecommend',methods=['POST'])
def rerecommend():
    input = request.form.get('user_input')
    if input in test['Book-Title'].values:
        index = np.where(pt.index == input)[0][0]
        similar_items = sorted(list(enumerate(similarity_scores[index])), key=lambda x: x[1], reverse=True)[0:11]

        data = []
        for i in similar_items:
            item = []
            print(pt.index[i[0]])
            temp_df = books[books['Book-Title'] == pt.index[i[0]]]
            item.extend(list(temp_df.drop_duplicates('Book-Title')['Book-Title'].values))
            item.extend(list(temp_df.drop_duplicates('Book-Title')['Book-Author'].values))
            item.extend(list(temp_df.drop_duplicates('Book-Title')['Image-URL-M'].values))
            avg_ratings = avg_rating_df.loc[avg_rating_df['Book-Title'] == pt.index[i[0]], 'avg-ratings'].values[0]

            isbn_number = temp_df.drop_duplicates('Book-Title')['ISBN'].values[0]
            item.append(avg_ratings)
            item.append(isbn_number)

            data.append(item)
    else:
        api_url = f'https://www.googleapis.com/books/v1/volumes?q=intitle:{input}&maxResults=11'
        response = requests.get(api_url)
        if response.status_code == 200:
            data = response.json()
            if 'items' in data:
                results = []
                for item in data['items']:
                    volume_info = item.get('volumeInfo', {})
                    title = volume_info.get('title', 'N/A')
                    authors = volume_info.get('authors', ['N/A'])
                    authors = authors[0] if authors else 'N/A'

                    image_url = volume_info['imageLinks']['thumbnail'] if 'imageLinks' in volume_info else '/static/images/defaultbook.jpg'
                    avg_rating = volume_info.get('averageRating', 'N/A')
                    identifiers = volume_info.get('industryIdentifiers', [])
                    isbn_10 = next((identifier['identifier'] for identifier in identifiers if identifier.get('type') == 'ISBN_10'), None)
                    other_identifier = next((identifier['identifier'] for identifier in identifiers if identifier.get('type') == 'OTHER'), None)
                    isbn_number = isbn_10 if isbn_10 else other_identifier

                    results.append([title, authors, image_url, avg_rating, isbn_number])
                return jsonify(data=results)
            else:
                return render_template('recommend.html', data=None)
        else:
            return render_template('recommend.html', data=None)
    return jsonify(data=data)


@app.route('/dropdown', methods=['GET'])
def dropdown():
    query = request.args.get('q').lower()
    filtered_titles = [title for title in list(test['Book-Title'].values) if query in title.lower()]
    return jsonify({'book_titles': filtered_titles})



@app.route('/contact')
def contact():
    return render_template('contact.html')


@app.route('/faqs')
def faqs():
    return render_template('faqs.html')

@app.route('/about')
def about():
    return render_template('about.html')

if __name__ == '__main__':
    app.run(debug=True)