FROM node:13.0.1

MAINTAINER Widestage  <widestage.com>

RUN apt-get update  &&  npm install -g bower

WORKDIR /srv/app/

COPY . /srv/app/

RUN npm install

RUN bower install --allow-root --force-latest

ENTRYPOINT ["node"]

CMD ["server.js"]
