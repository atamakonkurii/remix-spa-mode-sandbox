FROM node:22.13.0
RUN apt update -qq && apt install -y vim
WORKDIR /usr/src