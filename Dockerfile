FROM    ubuntu:14.04

RUN     apt-get update && apt-get install -y \
        git \
        curl \
        nano \
        build-essential \
        libssl-dev \
        libreadline-dev \
        libffi-dev \
        libgdbm-dev \
        nodejs \
        nodejs-dev \
        npm

# Install Ruby
ADD     http://cache.ruby-lang.org/pub/ruby/2.1/ruby-2.1.2.tar.bz2 /
RUN     tar xvjf ruby-2.1.2.tar.bz2 && cd ruby-2.1.2 && ./configure --disable-install-doc --with-openssl-dir=/usr/bin && make && make install && cd / && rm -rf /ruby-2.1.2

# Install other essential gems and npm packages
RUN     gem install compass foreman --no-ri --no-rdoc
RUN     ln -s /usr/bin/nodejs /usr/bin/node
RUN     npm install -g bower grunt-cli

RUN     mkdir /apps
ADD     . /apps/webuild
RUN     chmod +x /apps/webuild/run.sh

WORKDIR /apps/webuild

RUN     npm install && bower install --allow-root && grunt
RUN     npm install htmlstrip-native

EXPOSE  4000

CMD     /apps/webuild/run.sh
