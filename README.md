# Getting Started
This section details steps for installing and running WEVOTE. Current WEVOTE version only supports Linux. If you experience difficulty installing or running the software, please contact (Ahmed Metwally: ametwa2@uic.edu).

### Prerequisites
* cpprest: a restfull API c++ library. [Follow this link for installation.](https://github.com/Microsoft/cpprestsdk/wiki)
* BLASTN, Kraken, TIPP, CLARK, and MetaPhlan installed on the machine. 
* g++: 
```shell
sudo apt-get install build-essential
```

* OpenMP: for multithreading execution. 
* CMake (minimum version 3.9): 
```
sudo apt-get install cmake
``` 
* Qt SDK: for command line argument processing beside other modules are expected to be used extensively through development. [Follow these instruction for installing Qt SDK.](https://wiki.qt.io/Install_Qt_5_on_Ubuntu).
* A machine with RAM of at least 75 GB to run Kraken and Clark. You may ignore this prerequisite if you do not use kraken or clark. 
* R: for generating summary statistics, graphs, and messaging the data to be compatible with Phyloseq package. 

</br>

## Installing, Testing, and Running

### Installing Wevote Cpp Applications.

#### Clone the project to your local repository:
```
git clone https://bitbucket.org/asem_abdelaziz/wevote
```


#### Change directory to wevote-service, then build wevote-service from scratch:
```
cd wevote
mkdir build
cd build
cmake -DCMAKE_PREFIX_PATH="<path-to-qt-installed-library>" -DCMAKE_INSTALL_PREFIX="<target-installation-directory>" ..
```
An example where Qt root directory installed at ```/opt``` and we intend to install the project in ```/projects/wevote```.
```
cmake -DCMAKE_PREFIX_PATH="/opt/Qt5.9.1/5.9.1/gcc_64/lib/cmake" -DCMAKE_INSTALL_PREFIX="/projects/wevote" -DCMAKE_BUILD_TYPE=Release ..
```

After installation three applications are installed at ```CMAKE_INSTALL_PREFIX/bin```: 
* wevoteClassifier: wevote classification app from an ensemble file including multiple votes (i.e taxonomic binning). 
* abundanceAnnotator: evaluating the abundance per taxonomic identification. 
* wevoteREST: an Http Restful server with multiple functionalities. 

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
cmake -DCMAKE_PREFIX_PATH="/opt/Qt5.9.1/5.9.1/gcc_64/lib/cmake" -DCMAKE_INSTALL_PREFIX="/projects/wevote" -DTEST_TAXONOMY_DIRECTORY="/projects/data/taxonomy" -DTEST_ENSEMBLE_CSV_FILE="/projects/data/03C31_S1_71_ensemble.csv"  ..
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
