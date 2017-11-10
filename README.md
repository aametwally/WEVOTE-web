# Table of Contents
1. [WEVOTE Computational Module](#wevote-computational)
    1. [Getting Started](#computational-getting-started)
    2. [Prerequisites](#computational-prerequisites)
    3. [Installing, Testing, and Running](#computational-installing)
2. [WEVOTE Web Module](#wevote-web)
    1. [Overview](#web-overview)
    2. [Prerequisites](#web-prerequisites)
    3. [Building and running the application](#web-installing)
3. [Amazon AMI with a complete setup](#ami)





# WEVOTE Computational Module<div id='wevote-computational'></div>
## Getting Started <div id='computational-getting-started'></div>
This section details steps for installing and running WEVOTE. Current WEVOTE version only supports Linux. If you experience difficulty installing or running the software, please contact (Ahmed Metwally: ametwa2@uic.edu).

## Prerequisites <div id='computational-prerequisites'></div>
* cpprest: a restfull API c++ library. [Follow this link for installation.](https://github.com/Microsoft/cpprestsdk/wiki)
* BLASTN, Kraken, TIPP, CLARK, and MetaPhlan installed on the machine. 
* g++: 
```shell
sudo apt-get install build-essential
```

* OpenMP: for multithreading execution. 
* CMake (minimum version 3.5): 
```
sudo apt-get install cmake
``` 
* Qt SDK: for command line argument processing beside other modules are expected to be used extensively through development. [Follow these instruction for installing Qt SDK.](https://wiki.qt.io/Install_Qt_5_on_Ubuntu).
* A machine with RAM of at least 75 GB to run Kraken and Clark. You may ignore this prerequisite if you do not use kraken or clark. 
* R: for generating summary statistics, graphs, and messaging the data to be compatible with Phyloseq package. 



## Installing, Testing, and Running<div id='computational-installing'></div>

### Installing Wevote Cpp Applications.

#### Clone the project to your local repository:
```
git clone https://github.com/aametwally/WEVOTE-web.git
```


#### Change directory to wevote-service, then build wevote-service from scratch:
```
cd wevote
mkdir build
cd build
cmake -DCMAKE_PREFIX_PATH="<path-to-qt-installed-library>"  -DBLASTN_PATH="<path-to-BLASTN-dir>" -DBLASTN_DB="<path-to-BLASTN-database>" -DKRAKEN_PATH="<path-to-KRAKEN-dir>" -DKRAKEN_DB="<path-to-KRAKEN-database>" -DCLARK_PATH="<path-CLARK-dir>" -DCLARK_DB="<path-to-CLARK-database>" -DMETAPHLAN_PATH="<path-to-MetaPhlAn-dir>" -DTIPP_PATH="<path-to-TIPP-dir>" -DCMAKE_INSTALL_PREFIX="<target-installation-directory>" ..
```
An example where Qt root directory installed at ```/opt``` and we intend to install the project in ```/projects/wevote```.
```
cmake -DCMAKE_PREFIX_PATH="/opt/Qt5.9.1/5.9.1/gcc_64/lib/cmake" -DCMAKE_INSTALL_PREFIX="/projects/wevote" -DCMAKE_BUILD_TYPE=Release ..
```

After installation three applications are installed at ```CMAKE_INSTALL_PREFIX/bin```: 
* wevotePipeline: the full pipeline app from sequences file.
* wevoteClassifier: wevote classification app accepts as an input an ensemble file including multiple votes (i.e taxonomic binning) per sequence. 
* abundanceAnnotator: generating the community profile from WEVOTE classification file. 
* wevoteREST: an Http Restful server with exposing the the pipeline with the three different use cases: full pipeline, classification, and community profile. 

### Running WEVOTE Rest computational server:
```
cd <CMAKE_INSTALL_PREFIX>/bin
./wevoteREST -h
```

```
Usage: E:\repo\wevote\build\bin\Release\wevoteREST.exe [options]
E:\repo\wevote\build\bin\Release\wevoteREST.exe help

Options:
  -?, -h, --help                             Displays this help.
  -H, --host <host>                          host where application is served.
  -P, --port <port>                          The port (i.e socket number)
                                             selected for the application.
  -W, --wevote-host <wevote-host>            host where central wevote server
                                             served.
  -R, --wevote-port <port>                   The port (i.e socket number)
                                             selected for the central wevote
                                             server.
  -A, --wevote-path <wevote-path>            The relative path used to submit
                                             wevote results.
  -d, --taxonomy-db-path <taxonomy-db-path>  The path of the taxonomy database
                                             file.
  -v, --verbose <verbose>                    Enable verbose mode.
```

#### Example 
```
.\wevoteREST.exe -d path/to/taxonomy/dir
```

### Testing Wevote Classifier
To run unit tests the path of ensemble file ```TEST_ENSEMBLE_CSV_FILE``` and the taxonomy files directory ```TEST_TAXONOMY_DIRECTORY``` need to be introduced
in the cmake command. For example: 
```
cd wevote
mkdir build
cd build
cmake -DCMAKE_PREFIX_PATH="/opt/Qt5.9.1/5.9.1/gcc_64/lib/cmake" -DCMAKE_INSTALL_PREFIX="/projects/wevote" -DTEST_TAXONOMY_DIRECTORY="/projects/data/taxonomy" -DTEST_ENSEMBLE_CSV_FILE="/projects/data/03C31_S1_71_ensemble.csv" -DCMAKE_BUILD_TYPE=Release  ..
```
### Running Wevote Classifier:
#### Change directory to ```CMAKE_INSTALL_PREFIX/bin```

```
cd /projects/wevote/bin
./wevoteClassifier -h
```

```
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

### Running Abundance Annotator:
```
cd /projects/wevote/bin
./abundanceAnnotator -h
```

```
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


# WEVOTE Web Module <div id='wevote-web'></div>
## Overview <div id='web-overview'></div>
This module provides the web application that backs the WEVOTE taxonomic classification system, [More](http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0163527).  
The module includes a server, client, visualization applications. All applications are 
purely implemented in TypeScript. The server application is based on Express.js and mongoose 
libraries and handles all database operations, user sessions, and communication with the WEVOTE computational server [See wevote computational server](#wevote-computational).  
While the client and visualization applications (the front-end side) is implemented
using the AngularJS framework and d3.js library.

## Prerequisites <div id='web-prerequisites'></div>
* Node v6: [installation instructions](https://nodejs.org/en/download/package-manager/).
* MongoDB: installation instructions [(Linux)](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/) or [(windows)](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/) .  
* Wevote computational server (server must be running before running wevote-web server): [installation and running instruction](https://bitbucket.org/asem_abdelaziz/wevote/overview)
</br>

## Building and running the application <div id='web-installing'></div>

#### Change directory to web, then build wevote-web from scratch:
```
cd wevote-web
npm install
npm run build
```

#### Running the application.
##### Before running make sure: 
* The [wevote computational server](#wevote-computational) is running.
* The MongoDB is running: 
e.g on linux:
```
sudo service mongod start
```

##### Launching Wevote Server:
```
npm start
```



# Amazon AMI with a complete setup <div id='ami'></div>
A complete setup of the project including the five classification methods (i.e BLASTN, KRAKEN, CLARK, MetaPhlAn, TIPP), is available through Amazon Machine Image (AMI), using a **500 GB EBS** storage. The memory budget of the instance is subject to the intended methods to use. For example, if the methods are used, but KRAKEN and CLARK, an instance with memory of **1 GiB**. Whereas, incorporating KRAKEN and CLARK would require an instance of **80 GiB** memory budget.

## Usage
1. Launch an instance with approporiate specifications using the public AMI [ami-7e2a9e04](https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#Images:visibility=public-images;search=ami-7e2a9e04;sort=tag:Name).

2. Connect with a new session and run the WEVOTE computational server:
    1. Change the directory to the executable: `cd /projects/wevote/bin`
    2. Run `./wevoteREST -d <taxonomy-dir>`.

3. Connect with another session and change directory to `wevote-root`/web: 
    1. The client application has to be updated with the Url of the instance. Open with an editor (e.g `nano`), then edit `wevote-root`/web/app/server/config.js. 
    2. Update the Url value at line no. 5 with the instance url, for example: 
    ```javascript
    'url': 'http://ec2-54-157-9-86.compute-1.amazonaws.com',
    ```
    3. To apply changes run: `npm run build`.
     
    4. Activate the `MongoDB` service: `sudo service mongod start`, then start the web application: `npm start`.

4. From the Amazon Web Console, edit the security group attached to your instance and add new **Inbound** rule with the following parameters: 

Type | Protocol | Port Range | Source 
------------ | ------------- | ------------- | ------------- 
Custom TCP Rule | TCP | 8080 | ::/0, 0.0.0.0/0 


5. From the browser access to your instance url at protocol 8080 (e.g `http://ec2-54-157-9-86.compute-1.amazonaws.com:8080`).