#include "headers.hpp"
#include "helpers.hpp"
#include "create_db.hpp"

#include "CommandLineParser.hpp"

#define DEFAULT_NUM_THREADS 1
#define DEFAULT_SCORE 0
#define DEFAULT_MIN_NUM_AGREED 0
#define DEFAULT_PERNALTY 2

map<uint32_t, uint32_t> parentMap;
map<uint32_t, string> rankMap;
map<uint32_t, uint32_t> standardMap;
map<uint32_t, string> namesMap;
uint32_t undefined=0;

struct WevoteParameters
{
    bool verbose;
    std::string query;
    std::string prefix;
    std::string taxonomyDB;
    uint32_t score;
    int threads;
    int penalty;
    uint32_t minNumAgreed;
    std::string toString() const
    {
        std::stringstream stream;
        stream << "[verbose:" << verbose << "]"
               << "[input:" << query << "]"
               << "[prefix:" << prefix << "]"
               << "[taxonomyDB:" << taxonomyDB << "]"
               << "[score:" << score << "]"
               << "[threads:" << threads << "]"
               << "[penalty:" << penalty << "]"
               << "[minNumAgreed:" << minNumAgreed << "]";
        return stream.str();
    }
    WevoteParameters()
        : threads{1}, penalty{2}, minNumAgreed{0}, score{0}, verbose{false}
    {}
};

struct ParsingResults
{
    CommandLineParser::CommandLineResult success;
    std::string errorMessage;
    WevoteParameters parameters;
    ParsingResults()
        : success( CommandLineParser::CommandLineResult::CommandLineOk ),
          errorMessage("")
    {}
};

const std::list< QCommandLineOption > commandLineOptions =
{
    {
        QStringList() << "i" << "input-file",
        "Input ensemble file produced by the used algorithms."  ,
        "input-file"
    },
    {
        QStringList() << "d" <<  "taxonomy-db-path",
        "The path of the taxonomy database file." ,
        "taxonomy-db-path"
    },
    {
        QStringList() << "p" <<  "output-prefix",
        "OutputFile Prefix" ,
        "output-prefix"
    },
    {
        QStringList() << "n" <<  "threads",
        "Num of threads." ,
        "threads" ,
        QString::number( DEFAULT_NUM_THREADS )
    },
    {
        QStringList() << "k" <<  "penalty",
        "Penalty." ,
        "penalty",
        QString::number( DEFAULT_PERNALTY )
    },
    {
        QStringList() << "a" <<  "min-num-agreed",
        "Minimum number of tools agreed tools on WEVOTE decision." ,
        "min-num-agreed",
        QString::number( DEFAULT_MIN_NUM_AGREED )
    },
    {
        QStringList() << "s" <<  "score",
        "Score threshold." ,
        "score",
        QString::number( DEFAULT_SCORE )
    },
    {
        QStringList() << "v" <<  "verbose",
        "Enable verbose mode." ,
        "verbose",
        QString::number( 1 )
    }
};

auto extractFunction = []( const QCommandLineParser &parser , ParsingResults &results)
{
    /// parse commandline arguments
    if( parser.isSet("input-file"))
    {
        results.success = CommandLineParser::CommandLineResult::CommandLineError;
        results.errorMessage = "Input file is not specified.";
        return;
    }
    if( parser.isSet("taxonomy-db-path"))
    {
        results.success = CommandLineParser::CommandLineResult::CommandLineError;
        results.errorMessage = "Taxonomy file is not specified.";
        return;
    }
    if( parser.isSet("output-prefix"))
    {
        results.success = CommandLineParser::CommandLineResult::CommandLineError;
        results.errorMessage = "Output prefix is not specified.";
        return;
    }
    results.parameters.verbose =
            static_cast< bool >(parser.value("verbose").toShort());
    results.parameters.query =
            parser.value("input-file");
    results.parameters.taxonomyDB =
            parser.value("taxonomy-db-path");
    results.parameters.prefix =
            parser.value("output-prefix");
    results.parameters.penalty =
            parser.value("penalty").toInt();
    results.parameters.score =
            parser.value("score").toUInt();
    results.parameters.threads =
            parser.value("threads").toInt();
    results.parameters.minNumAgreed =
            parser.value("min-num-agreed").toUInt();
};

int main(int argc, char *argv[])
{
    QCoreApplication a( argc , argv );
    auto cmdLineParser =
            CommandLineParser( a , commandLineOptions ,
                               std::string(argv[0]) + " help" );
    ParsingResults parsingResults;
    cmdLineParser.process();
    cmdLineParser.tokenize( extractFunction , parsingResults );

    if( parsingResults.success == CommandLineParser::CommandLineResult::CommandLineError )
        LOG_ERROR("Command line error: %s", parsingResults.errorMessage.c_str());
    else
        LOG_DEBUG("parameters: %s\n", parsingResults.parameters.toString().c_str());

    const auto &param = parsingResults.parameters;

    const std::string nodesFilename= param.taxonomyDB+"/nodes_wevote.dmp";
    const std::string namesFilename= param.taxonomyDB+"/names_wevote.dmp";
    const std::string outputDetails= param.prefix + "_WEVOTE_Details.txt";
    const std::string outputWEVOTE= param.prefix + "_WEVOTE.csv";
    LOG_INFO("NodesFilename=%s\n", nodesFilename);
    LOG_INFO("NamesFilename=%s\n", namesFilename);


    /// Build taxonomy trees
    parentMap = build_full_taxid_map(nodesFilename);
    rankMap = build_full_rank_map(nodesFilename);
    standardMap=build_standard_taxid_map(nodesFilename, parentMap, rankMap);
    namesMap = build_taxname_map(namesFilename);


    /// Read CSV formated input file
    std::vector<readsInfo> Reads;
    readsInfo OneRead;
    Reads.clear();
    ifstream file (query.c_str());
    std::string line = "";
    int it=0;


    if (!file.is_open())
        LOG_ERROR("Error opening file:%s\n",param.query);


    while (getline(file, line))
    {
        stringstream strstr(line);
        string word = "";
        it=0;
        int value=0;
        (OneRead.annotation).clear();

        while (getline(strstr,word, ','))
        {
            if(it==0)
                OneRead.seqID=word;
            else
            {
                value=atoi(word.c_str());
                (OneRead.annotation).push_back(value);
            }
            it++;
        }
        Reads.push_back(OneRead);
    }


    uint32_t numToolsUsed=(Reads[0].annotation).size();
    uint32_t numReads= Reads.size();

    cout << "Num of reads= " << numReads << "\n";
    cout << "Num of used tools= " << numToolsUsed << "\n";

    if(minNumAgreed>numToolsUsed)
    {
        cout<< "It's not allwed that minNumAgreed > numTools \n";
        exit(1);
    }

    for (uint32_t i=0 ; i<Reads.size() ; i++)
    {
        Reads[i].numToolsUsed=numToolsUsed;
    }



    /// Correct TaxonID for the not standard ranks
    correctTaxa(Reads);

    /// Count number of tools that identified each sequences
    uint32_t count=0;
    for (uint32_t i=0 ; i<Reads.size() ; i++)
    {
        count=0;
        for (uint32_t j=0 ; j<(Reads[i].annotation).size() ; j++)
        {

            if (Reads[i].annotation[j] && 1)
                count++;
        }
        Reads[i].numToolsReported=count;
    }



    /// WEVOTE algorithm
    map<uint32_t, uint32_t> hit_counts;
    set<uint32_t> parents;
    std::set<uint32_t>::iterator set_iterator;
    std::map<uint32_t, uint32_t>::iterator iterator_name;
    uint32_t SavedTax_2[2];
    uint32_t n=0;

    double start = omp_get_wtime();
    omp_set_num_threads(threads);
    cout << "Min Number of Agreed= "<< minNumAgreed << "\n";

#pragma omp parallel for private (hit_counts, parents, set_iterator, iterator_name, SavedTax_2, n)
    for (uint32_t i=0 ; i<Reads.size() ;i++)
    {
        if (Reads[i].numToolsReported == 0)
        {
            Reads[i].resolvedTaxon=0;
            Reads[i].numToolsAgreed=numToolsUsed;
            Reads[i].score=1;
            continue;
        }
        else if(Reads[i].numToolsReported == 1 && minNumAgreed<=1)
        {
            Reads[i].resolvedTaxon=0;
            for (uint32_t j=0 ; j<numToolsUsed ; j++)
            {
                Reads[i].resolvedTaxon += Reads[i].annotation[j];
            }
            Reads[i].numToolsAgreed=1;
            if(Reads[i].numToolsAgreed==Reads[i].numToolsReported)
            {
                Reads[i].score=(double)Reads[i].numToolsAgreed / (double)Reads[i].numToolsUsed;
            }
            else
            {
                Reads[i].score=((double)Reads[i].numToolsAgreed / (double)Reads[i].numToolsUsed) - (1/penalty*((double)Reads[i].numToolsUsed));
            }
            continue;
        }
        else if(Reads[i].numToolsReported==2 && minNumAgreed<=2)
        {
            n=0;

            for (uint32_t j=0 ; j<numToolsUsed ; j++)
            {
                if(Reads[i].annotation[j])
                {
                    SavedTax_2[n]=Reads[i].annotation[j];
                    n++;
                }
            }

            Reads[i].resolvedTaxon=lca(SavedTax_2[0], SavedTax_2[1]);
            Reads[i].numToolsAgreed=2;
            if(Reads[i].numToolsAgreed==Reads[i].numToolsReported)
            {
                Reads[i].score=(double)Reads[i].numToolsAgreed / (double)Reads[i].numToolsUsed;
            }
            else
            {
                Reads[i].score=(double)Reads[i].numToolsReported / (double)(Reads[i].numToolsUsed * Reads[i].numToolsAgreed);
            }
            continue;
        }
        else if(Reads[i].numToolsReported>=3)
        {
            hit_counts.clear();
            for (uint32_t j=0 ; j<numToolsUsed ; j++)
            {
                parents=get_ancestry(Reads[i].annotation[j]);
                for(set_iterator = parents.begin(); set_iterator != parents.end(); set_iterator++)
                {
                    hit_counts[*set_iterator]++;
                }
            }

            /// Resolve tree for each sequence to get WEVOTE annotation
            Reads[i].resolvedTaxon=resolve_tree(hit_counts, Reads[i].numToolsReported, minNumAgreed);
            Reads[i].numToolsAgreed=hit_counts[Reads[i].resolvedTaxon];

            if(Reads[i].numToolsAgreed==Reads[i].numToolsReported)
            {
                Reads[i].score=(double)Reads[i].numToolsAgreed / (double)Reads[i].numToolsUsed;
            }
            else
            {
                Reads[i].score=((double)Reads[i].numToolsAgreed / (double)(Reads[i].numToolsUsed)) - (1/ (penalty * ((double)Reads[i].numToolsUsed)));
            }
        }
        else
        {
            Reads[i].resolvedTaxon=0;
            Reads[i].numToolsAgreed=0;
            Reads[i].score=0;
            continue;
        }
    }
    double end = omp_get_wtime();
    double total=end-start;
    cout << "WEVOTE classification executed in= " << total << "\n";


    /// Export the detailed output in txt format
    ofstream myfile;
    myfile.open (OutputDetails.c_str());
    if (!myfile.is_open())
    {
        cout << "Error opening Output file: " << OutputDetails << "\n";
        exit(1);
    }

    string PrintString="";
    std::ostringstream ss;
    for (uint32_t i=0 ; i<Reads.size() ;i++)
    {
        ss.clear();
        ss.str("");
        PrintString="";
        for (uint32_t j=0 ; j<(Reads[i].annotation).size() ; j++)
        {
            ss.clear();
            ss.str("");
            PrintString = PrintString + "\t";
            ss << Reads[i].annotation[j];
            PrintString = PrintString + ss.str();
        }

        myfile << Reads[i].seqID << "\t" << Reads[i].numToolsUsed << "\t" << Reads[i].numToolsReported << "\t" << Reads[i].numToolsAgreed<<"\t" << Reads[i].score << "\t" << PrintString << "\t" << Reads[i].resolvedTaxon << "\n";

    }
    myfile.close();

}
