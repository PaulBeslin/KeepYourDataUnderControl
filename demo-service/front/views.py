import os

from dotenv import load_dotenv
from flask import (
    Blueprint,
    url_for,
    redirect,
    render_template,
    request,
)
import requests

views = Blueprint('views', __name__, url_prefix="")

load_dotenv()
API_ENDPOINT = os.environ.get('API_ENDPOINT')

@views.route('/')
def home():
    req = requests.get(API_ENDPOINT+'/posts')
    if req.status_code == requests.codes.ok:
        posts = req.json()['posts']
        return render_template('home.html', posts=posts)

@views.route('/post/add', methods=['POST'])
def post_add():
    uploaded_file = request.files['file']
    files = {'file': (uploaded_file.filename, uploaded_file)}
    req = requests.post(API_ENDPOINT+"/posts", files=files)
    if req.status_code == requests.codes.ok:
        return redirect(url_for('views.home'), code=302)

@views.route('/post/edit/<id_post>', methods=['POST'])
def post_edit(id_post):
    new_file = request.files['file']
    files = {'file': (new_file.filename, new_file)}

    req = requests.put(API_ENDPOINT+'/posts/'+id_post, files=files)
    if req.status_code == requests.codes.ok:
        return redirect(url_for('views.home'), code=302)

@views.route('/post/delete/<id_post>')
def post_delete(id_post):
    req = requests.delete(API_ENDPOINT+'/posts/'+id_post)
    if req.status_code == requests.codes.ok:
        return redirect(url_for('views.home'), code=302)

@views.route('/post/<id_post>/comment/add', methods=['POST'])
def comment_add(id_post):

    req = requests.post(
        API_ENDPOINT+'/posts/'+id_post+'/comments',
        json={'comment': request.form['comment']}
    )
    if req.status_code == requests.codes.ok:
        return redirect(url_for('views.home'), code=302)

@views.route('/comment/edit/<id_comment>', methods=['POST'])
def comment_edit(id_comment):
    req = requests.put(
        API_ENDPOINT+'/comments/'+id_comment,
        json={'comment': request.form['comment']}
    )
    if req.status_code == requests.codes.ok:
        return redirect(url_for('views.home'), code=302)

@views.route('/comment/delete/<id_comment>')
def comment_delete(id_comment):
    req = requests.delete(API_ENDPOINT+'/comments/'+id_comment)
    if req.status_code == requests.codes.ok:
        return redirect(url_for('views.home'), code=302)
