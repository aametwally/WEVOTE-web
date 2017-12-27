# OS image
FROM ubuntu:16.04

# Install prerequisites
RUN \
  sed -i 's/# \(.*multiverse$\)/\1/g' /etc/apt/sources.list && \
  apt-get update -qq && \
  apt-get upgrade -qq && \
  apt-get install -qq build-essential clang && \
  apt-get install -qq software-properties-common && \
  apt-get install -qq curl git htop wget && \
  apt-get install -qq cmake qt5-default libcpprest-dev && \
  rm -rf /var/lib/apt/lists/*

# Set environment variables.
ENV HOME /root

# Define working directory.
WORKDIR /root


COPY . /root/WEVOTE-web
WORKDIR /root/WEVOTE-web
RUN mkdir build
WORKDIR /root/WEVOTE-web/build
RUN cmake -DCMAKE_BUILD_TYPE=Release \
-DCMAKE_INSTALL_PREFIX=/root/wevote-install ..
RUN make && make install


# Download Taxonomy DB
WORKDIR /root
RUN mkdir db
WORKDIR db
RUN wget ftp://ftp.ncbi.nlm.nih.gov/pub/taxonomy/taxdump.tar.gz && tar xzf taxdump.tar.gz && rm taxdump.tar.gz

EXPOSE 34568
CMD ["/root/wevote-install/bin/wevoteREST" , "-d","/root/db", "-H" , "computational" , "-P" , "34568" ]
