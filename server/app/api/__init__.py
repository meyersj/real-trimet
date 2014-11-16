from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

app = Flask(__name__)
app.config.from_object('config')

#modifed to False if deploying with wsgi

app.debug = True
engine = create_engine(app.config['DB_CONFIG'])
Session = sessionmaker(bind=engine)
db_session = Session()

# assign new function names
# to make deubg and error logging easier
debug = app.logger.debug
error = app.logger.error

from api import endpoints
