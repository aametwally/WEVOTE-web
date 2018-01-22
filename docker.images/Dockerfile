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
  apt-get install -qq bowtie2 && \
  apt-get -qq install python-pip && \
  rm -rf /var/lib/apt/lists/* && \
  LC_ALL=C pip install numpy

# Set environment variables.
ENV HOME /root


# Define working directory.
WORKDIR /root

# Binning Tools
RUN mkdir /root/WEVOTE_PACKAGE
WORKDIR /root/WEVOTE_PACKAGE

## 1. Copy other binning tools.
ADD ../../WEVOTE_PACKAGE /root/WEVOTE_PACKAGE 

## 2. Our ensemble WEVOTE
### a. Download Taxonomy DB
RUN mkdir /root/WEVOTE_PACKAGE/WEVOTE_DB
WORKDIR /root/WEVOTE_PACKAGE/WEVOTE_DB
RUN wget ftp://ftp.ncbi.nlm.nih.gov/pub/taxonomy/taxdump.tar.gz && tar xzf taxdump.tar.gz && rm taxdump.tar.gz

### b. Our application.
WORKDIR /root/WEVOTE_PACKAGE
RUN git clone git@github.com:aametwally/WEVOTE-web.git
WORKDIR WEVOTE-web

RUN mkdir build
WORKDIR build
RUN cmake -DCMAKE_BUILD_TYPE=Release \
-DCMAKE_INSTALL_PREFIX=/root/WEVOTE_PACKAGE/WEVOTE \
-DBLASTN_PATH=/root/WEVOTE_PACKAGE/blast \
-DBLASTN_DB=/root/WEVOTE_PACKAGE/blastDB/nt \
-DKRAKEN_PATH=/root/WEVOTE_PACKAGE/kraken \
-DKRAKEN_DB=/root/WEVOTE_PACKAGE/krakenDB \
-DCLARK_PATH=/root/WEVOTE_PACKAGE/clark \
-DCLARK_DB=/root/WEVOTE_PACKAGE/clarkDB \
-DMETAPHLAN_PATH=/root/WEVOTE_PACKAGE/metaphlan ..
RUN make && make install


EXPOSE 34568
CMD ["/root/WEVOTE_PACKAGE/WEVOTE/bin/wevoteREST" , "-d","/root/WEVOTE_PACKAGE/WEVOTE_DB" , "-H" , "0.0.0.0"]
