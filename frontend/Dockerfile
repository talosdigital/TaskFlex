FROM ubuntu

RUN apt-get update
RUN apt-get install -y build-essential nodejs npm nodejs-legacy git

RUN mkdir /taskflex
ADD . /taskflex
WORKDIR /taskflex

RUN npm install -g gulp
RUN npm install -g bower
RUN npm install
RUN bower --allow-root install

CMD ["npm", "start"]
