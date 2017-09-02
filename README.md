# Getting Started
This section details steps for installing and running WEVOTE. Current WEVOTE version only supports Linux. If you experience difficulty installing or running the software, please contact (Ahmed Metwally: ametwa2@uic.edu).

### Prerequisites

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

</br>

## Installing, Testing, and Running

### Installing Wevote Classifier
#### Clone the project to your local repository:
```
git clone https://bitbucket.org/asem_abdelaziz/wevote-service
```


#### Change directory to wevote-service, then build wevote-service from scratch:
```
cd wevote-service
mkdir build
cd build
cmake -DCMAKE_PREFIX_PATH="<path-to-qt-installed-library>" -DCMAKE_INSTALL_PREFIX="<target-installation-directory>" ..
```
An example where Qt root directory installed at ```/opt``` and we intend to install the project in ```/projects/wevote```.
```
cmake -DCMAKE_PREFIX_PATH="/opt/Qt5.9.1/5.9.1/gcc_64/lib/cmake" -DCMAKE_INSTALL_PREFIX="/projects/wevote" -DCMAKE_BUILD_TYPE=Release ..
```

### Testing Wevote Classifier
To run unit tests the path of ensemble file ```TEST_ENSEMBLE_CSV_FILE``` and the taxonomy files directory ```TEST_TAXONOMY_DIRECTORY``` need to be introduced
in the cmake command. For example: 
```
cd wevote-service
mkdir build
cd build
cmake -DCMAKE_PREFIX_PATH="/opt/Qt5.9.1/5.9.1/gcc_64/lib/cmake" -DCMAKE_INSTALL_PREFIX="/projects/wevote" -DTEST_TAXONOMY_DIRECTORY="/projects/data/taxonomy" -DTEST_ENSEMBLE_CSV_FILE="/projects/data/03C31_S1_71_ensemble.csv"  ..
```
### Running Wevote Classifier:
#### Change directory to ```dist-dir/bin```

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
