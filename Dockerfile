FROM node:latest

MAINTAINER Widestage  <widestage.com>

RUN apt-get update  &&  npm install -g bower

WORKDIR /srv/app/

COPY . /srv/app/

RUN npm install

RUN bower install --allow-root --force-latest

EXPOSE 80

CMD ["npm" , "start"]
