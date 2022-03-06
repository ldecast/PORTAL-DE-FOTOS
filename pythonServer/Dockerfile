FROM python:3.9-alpine3.14

COPY . .

WORKDIR /

RUN /usr/local/bin/python -m pip install --upgrade pip
RUN pip install flask
RUN pip install flask-cors
RUN pip install python-dotenv
RUN pip install flask-jwt
RUN pip install PyJWT
RUN pip install boto3
RUN pip install waitress


EXPOSE 5000

CMD ["python", "wsgi.py"]
