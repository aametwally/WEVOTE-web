# What is WEVOTE-web?

[![Build Status](https://travis-ci.org/aametwally/WEVOTE-web.svg?branch=master)](https://travis-ci.org/aametwally/WEVOTE-web)

WEVOTE-web is cloud-based framework of the WEVOTE ensemble taxonomic identification method. The framework to improves the usability of WEVOTE algorithm. In addition, it provides an interactive visual analytics tool to ease the interpretation of the classification results. WEVOTE-web application can also be used by researchers as a repository to store their experimental history for further revisions. A complete setup for the project and its dependencies as a web application is available as an Amazon Machine Image (AMI) for a direct deployment on AWS EC2 machine. The latest AMI is [ami-34fba54e](https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#Images:visibility=public-images;search=ami-34fba54e;sort=name)

## Publication

1. Asem Alaa, Ahmed A. Metwally. "Cloud-based Solution for Improving Usability and Interactivity of Metagenomic Ensemble Taxonomic Identification Methods", IEEE Biomedical and Health Informatics, Accepted, 2018.

2. Ahmed A. Metwally, Yang Dai, Patricia W. Finn, and David L. Perkins. "WEVOTE: Weighted Voting Taxonomic Identification Method of Microbial Sequences." PloS one 11, no. 9 (2016): e0163527. [[online](http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0163527)]

## Table of Contents

1. [Amazon AMI with a complete setup](#ami)
2. [WEVOTE Computational Module: building from source](#wevote-computational)
    1. [Getting Started](#computational-getting-started)
    2. [Prerequisites](#computational-prerequisites)
    3. [Installing, Testing, and Running](#computational-installing)
    4. [Alternative method: building and running wevoteREST through Docker-Compose (Ubuntu Xenial 16.04)](#computational-docker-install)
        1. [Prerequisites](#computational-docker-prerequisites)
3. [WEVOTE Web Module: building from source](#wevote-web)
    1. [Overview](#web-overview)
    2. [Building and running the application](#web-native-install)
        1. [Prerequisites](#native-prerequisites)
    3. [Alternative method: building and running through Docker-Compose (Ubuntu Xenial 16.04)](#web-docker-install)
        1. [Prerequisites](#docker-prerequisites)

## Amazon AMI with a complete setup <div id='ami'></div>

A complete setup of the project including the five classification methods (i.e BLASTN, KRAKEN, CLARK, MetaPhlAn, TIPP), is available through Amazon Machine Image (AMI), using a **500 GB EBS** storage. The memory budget of the instance is subject to the intended methods to use. For example, if the methods are used, but KRAKEN and CLARK, an instance with memory of **1 GiB**. Whereas, incorporating KRAKEN and CLARK would require an instance of **80 GiB** memory budget.

### Usage

1. Launch an instance with approporiate specifications using the public AMI [ami-34fba54e](https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#Images:visibility=public-images;search=ami-34fba54e;sort=name).

2. From the Amazon Web Console, edit the security group attached to your instance by adding new **Inbound** rule with the following parameters: 

Type | Protocol | Port Range | Source 
------------ | ------------- | ------------- | ------------- 
Custom TCP Rule | TCP | 8080 | ::/0, 0.0.0.0/0 

3. Connect to the launched machine with a terminal 

4. Write the following to the instance's terminal
```
screen
cd /projects/wevote/bin  
nohup ./wevoteREST -d ~/WEVOTE_PACKAGE/WEVOTE_DB & 
sudo service mongod start  
cd ~/wevote/web  
npm run pipeline-amazon  
```

5. Now, you can access the web interface from any web-browser on any machine:
```
http://<the-launched-instance-Public-DNS>:8080>
e.g., (e.g `http://ec2-54-157-9-86.compute-1.amazonaws.com:8080`)
```



## WEVOTE Computational Module: building from source<div id='wevote-computational'></div>

### Getting Started <div id='computational-getting-started'></div>

This section details steps for installing and running WEVOTE. Current WEVOTE version only supports Linux. If you experience difficulty installing or running the software, please contact (Ahmed Metwally: ametwa2@uic.edu).

### Prerequisites <div id='computational-prerequisites'></div>

* g++.
* CMake (minimum version 3.5).
* Qt SDK: for command line argument processing beside other modules are expected to be used extensively through development.
* cpprest: a restfull API c++ library.
* OpenMP: for multithreading execution.

To install above dependencies:

```shell
sudo add-apt-repository universe
sudo apt-get update
sudo apt-get install build-essential cmake qt5-default libcpprest-dev
```

* BLASTN, Kraken, TIPP, CLARK, and MetaPhlan installed on the machine. 
* A machine with RAM of at least 75 GB to run Kraken and Clark. You may ignore this prerequisite if you do not use kraken or clark. 

### Installing, Testing, and Running<div id='computational-installing'></div>

### Installing WEVOTE Core applications

#### Clone the project to your machine

```shell
git clone https://github.com/aametwally/WEVOTE-web.git
```

#### Building the core library and applications using CMake

Assuming taxonomic binning tools and the corresponding database are installed at `~/WEVOTE_PACKAGE` as shown in the table:

Tool | Path | Database location
------------ | ------------- | -------------
BLASTN | `~/WEVOTE_PACKAGE/blast` | `~/WEVOTE_PACKAGE/blastDB/nt` (prefix) 
 CLARK | `~/WEVOTE_PACKAGE/clark` | `~/WEVOTE_PACKAGE/clarkDB` (dir)
 KRAKEN | `~/WEVOTE_PACKAGE/kraken` | `~/WEVOTE_PACKAGE/krakenDB` (dir)
 MetaPhlAn | `~/WEVOTE_PACKAGE/metaphlan` | -
 TIPP | `~/WEVOTE_PACKAGE/tipp` | -

In addition, the build type, installation prefix, and Qt root directory can be specified in the cmake command.
In this build, we the following configuration is used:

Parameter | Description | Value
------------ | ------------- | -------------
CMAKE_BUILD_TYPE | The build type (e.g Release or Debug) | `Release`
CMAKE_INSTALL_PREFIX | The installation directory | `/projects/wevote`

```shell
cd WEVOTE-web
mkdir build
cd build
cmake -DCMAKE_BUILD_TYPE=Release \
-DCMAKE_INSTALL_PREFIX=/projects/wevote \
-DBLASTN_PATH=/home/ubuntu/WEVOTE_PACKAGE/blast \
-DBLASTN_DB=/home/ubuntu/WEVOTE_PACKAGE/blastDB/nt \
-DKRAKEN_PATH=/home/ubuntu/WEVOTE_PACKAGE/kraken \
-DKRAKEN_DB=/home/ubuntu/WEVOTE_PACKAGE/krakenDB \
-DCLARK_PATH=/home/ubuntu/WEVOTE_PACKAGE/clark \
-DCLARK_DB=/home/ubuntu/WEVOTE_PACKAGE/clarkDB \
-DMETAPHLAN_PATH=/home/ubuntu/WEVOTE_PACKAGE/metaphlan ..
```

After installation three applications are installed at ```CMAKE_INSTALL_PREFIX/bin```:

* wevotePipeline: the full pipeline app from sequences file.
* wevoteClassifier: wevote classification app accepts as an input an ensemble file including multiple votes (i.e taxonomic binning) per sequence. 
* abundanceAnnotator: generating the community profile from WEVOTE classification file. 
* wevoteREST: an Http Restful server with exposing the the pipeline with the three different use cases: full pipeline, classification, and community profile. 

### Running WEVOTE Rest computational server

```shell
cd <CMAKE_INSTALL_PREFIX>/bin
./wevoteREST -h
```

```shell
Usage: ./wevoteREST [options]
./wevoteREST help

Options:
  -h, --help                                 Displays this help.
  -H, --host <host>                          host where application is served.
  -P, --port <port>                          The port (i.e socket number)
                                             selected for the application.
  -d, --taxonomy-db-path <taxonomy-db-path>  The path of the taxonomy database
                                             file.
  -v, --verbose <verbose>                    Enable verbose mode.
```

#### Example

```shell
./wevoteREST -d path/to/taxonomy/dir
```

### Running Wevote Classifier

#### Change directory to ```CMAKE_INSTALL_PREFIX/bin```

```shell
cd /projects/wevote/bin
./wevoteClassifier -h
```

```shell
Usage: ./wevoteClassifier [options]
./wevoteClassifier help

Options:
  -h, --help                                 Displays this help.
  -i, --input-file <input-file>              Input ensemble file produced by
                                             the used algorithms.
  -d, --taxonomy-db-path <taxonomy-db-path>  The path of the taxonomy database
                                             file.
  -p, --output-prefix <output-prefix>        OutputFile Prefix
  -n, --threads <threads>                    Num of threads.
  -k, --penalty <penalty>                    Penalty.
  -a, --min-num-agreed <min-num-agreed>      Minimum number of tools agreed
                                             tools on WEVOTE decision.
  -s, --score <score>                        Score threshold.
  -v, --verbose <verbose>                    Enable verbose mode.

```

### Running Abundance Annotator

```shell
cd /projects/wevote/bin
./abundanceAnnotator -h
```

```shell
Usage: ./abundanceAnnotator [options]
./abundanceAnnotator help

Options:
  -h, --help                                 Displays this help.
  -i, --input-file <input-file>              Input file produced by wevote
                                             algorithm.
  -d, --taxonomy-db-path <taxonomy-db-path>  The path of the taxonomy database
                                             file.
  -p, --output-prefix <output-prefix>        OutputFile Prefix

```

### Running Wevote Pipeline

```shell
cd /projects/wevote/bin
./wevotePipeline -h
```

```shell
Usage: ./wevotePipeline [options]
./wevotePipeline help

Options:
  -h, --help                                 Displays this help.
  -i, --input-file <input-file>              Input ensemble file produced by
                                             the used algorithms.
  -d, --taxonomy-db-path <taxonomy-db-path>  The path of the taxonomy database
                                             file.
  -p, --output-prefix <output-prefix>        OutputFile Prefix
  -n, --threads <threads>                    Num of threads.
  -k, --penalty <penalty>                    Penalty.
  -a, --min-num-agreed <min-num-agreed>      Minimum number of tools agreed
                                             tools on WEVOTE decision.
  -s, --score <score>                        Score threshold.
  --clark                                    Run CLARK.
  --blastn                                   Run BLASTN
  --tipp                                     Run TIPP.
  --metaphlan                                Run MetaPhlAn.
  --kraken                                   Run KRAKEN
  -v, --verbose <verbose>                    Enable verbose mode.

```

### Alternative method: building and running wevoteREST through Docker Container(Ubuntu Xenial 16.04)<div id='computational-docker-install'></div>

#### Prerequisites: Docker <div id='computational-docker-prerequisites'></div>

Install Docker Community Edition (CE): ([follow instructions](https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/#install-docker-ce-1)).

#### Change directory to web, then build and run wevoteREST as a docker container

```shell
cd WEVOTE-web
sudo docker build . -t computational
sudo docker run --rm -it computational
```

## WEVOTE Web Module: building from source <div id='wevote-web'></div>

## Overview <div id='web-overview'></div>

This module provides the web application that backs the WEVOTE taxonomic classification system, [More](http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0163527).
The module includes a server, client, visualization applications. All applications are purely implemented in TypeScript. The server application is based on Express.js and mongooselibraries and handles all database operations, user sessions, and communication with the WEVOTE computational server [See wevote computational server](#wevote-computational). While the client and visualization applications (the front-end side) is implemented using the AngularJS framework and d3.js library.

## Building and running the application <div id='web-native-install'></div>

### Prerequisites <div id='native-prerequisites'></div>

* Node v6: See [installation instructions](https://nodejs.org/en/download/package-manager/).

<strong>OR</strong> run the following commands:

```shell
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

* MongoDB: See [installation instructions](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/).
* Wevote computational server (server must be running before running wevote-web server): [installation and running instruction](#wevote-computational)

</br>

#### Change directory to web, then build wevote-web from scratch

```shell
cd WEVOTE-web/web
npm install
npm run build
```

#### Running the application

##### Before running make sure

* The [wevote computational server](#wevote-computational) is running.
* The MongoDB is running:

e.g on linux:

```shell
sudo service mongod start
```

##### Launching Wevote Server

```shell
npm start
```

## Alternative method: building and running through Docker-Compose (Ubuntu Xenial 16.04)<div id='web-docker-install'></div>

### Prerequisites: Docker & Docker-Compose <div id='docker-prerequisites'></div>

1. Installing Docker Community Edition (CE): ([follow instructions](https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/#install-docker-ce-1)).
2. Installing Docker-Compose: ([follow instructions](https://docs.docker.com/compose/install/#install-compose)).

#### Change directory to web, then build and run wevote-web as a dockerized application

```shell
cd WEVOTE-web/web
sudo docker-compose run --build
```
