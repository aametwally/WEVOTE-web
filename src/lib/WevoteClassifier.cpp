#include "WevoteClassifier.h"

namespace wevote
{

WevoteClassifier::WevoteClassifier( const TaxonomyBuilder &taxonomy )
    : _taxonomy( taxonomy )
{

}

void WevoteClassifier::classify(
        std::vector<ReadInfo> &reads,
        int minNumAgreed, int penalty, int threads) const
{
    LOG_INFO("Preprocessing reads..");
    _preprocessReads( reads );
    LOG_INFO("[DONE] Preprocessing reads..");

    /// WEVOTE algorithm
    const int numToolsUsed = reads.front().annotation.size();

    if( minNumAgreed > numToolsUsed)
        LOG_ERROR("It's not allwed that minNumAgreed > numTools");

    double start = omp_get_wtime();
    omp_set_num_threads(threads);
    LOG_DEBUG("Min Number of Agreed= %d" , minNumAgreed );

    LOG_INFO("Classification (%d threads)..",threads);
#pragma omp parallel for
    for (uint32_t i=0 ; i<reads.size() ;i++)
    {
        ReadInfo &read = reads[i];
        if ( read.numToolsReported == 0)
        {
            read.resolvedTaxon=0;
            read.numToolsAgreed=numToolsUsed;
            read.score=1;
        }
        else if( read.numToolsReported == 1 && minNumAgreed<=1)
        {
            read.resolvedTaxon=0;
            for ( uint32_t annotation : read.annotation )
                read.resolvedTaxon += annotation;

            read.numToolsAgreed=1;
            if( read.numToolsAgreed == read.numToolsReported )
                read.score=
                        (double)read.numToolsAgreed /
                        (double)read.numToolsUsed;

            else
                read.score =
                        ((double)read.numToolsAgreed /
                         (double)read.numToolsUsed) -
                        (1.f/penalty*((double)read.numToolsUsed));
        }
        else if(read.numToolsReported==2 && minNumAgreed<=2)
        {
            int n=0;
            uint32_t savedTax_2[2];
            for ( uint32_t annotation : read.annotation )
                if( annotation != ReadInfo::noAnnotation )
                    savedTax_2[n++]=annotation;

            WEVOTE_ASSERT( n == 2 , "n must be 2.");

            read.resolvedTaxon = _taxonomy.lca(savedTax_2[0], savedTax_2[1]);
            read.numToolsAgreed=2;
            if(read.numToolsAgreed==read.numToolsReported)
                read.score =
                        (double)read.numToolsAgreed /
                        (double)read.numToolsUsed;
            else
                read.score =
                        (double)read.numToolsReported /
                        (double)(read.numToolsUsed * read.numToolsAgreed);
        }
        else if( read.numToolsReported >= 3 )
        {
            std::map<uint32_t, uint32_t> hitCounts;
            for ( uint32_t annotation : read.annotation)
                for( uint32_t parent : _taxonomy.getAncestry( annotation ) )
                    hitCounts[ parent ]++;

            /// Resolve tree for each sequence to get WEVOTE annotation
            read.resolvedTaxon =
                    _taxonomy.resolveTree( hitCounts , read.numToolsReported ,
                                           minNumAgreed);
            read.numToolsAgreed=
                    hitCounts[read.resolvedTaxon];

            if(read.numToolsAgreed==read.numToolsReported)
                read.score=
                        (double)read.numToolsAgreed /
                        (double)read.numToolsUsed;

            else
                read.score=
                        ((double)read.numToolsAgreed /
                         (double)(read.numToolsUsed)) -
                        (1.f/ (penalty * ((double)read.numToolsUsed)));
        }
        else
        {
            read.resolvedTaxon=0;
            read.numToolsAgreed=0;
            read.score=0;
        }
    }
    double end = omp_get_wtime();
    double total=end-start;
    LOG_INFO("[DONE] Classification (%d threads)..",threads);
    LOG_INFO("WEVOTE classification executed in=%f" , total );
}

std::vector<ReadInfo> WevoteClassifier::getReads(
        const std::string &filename )
{
    std::vector<ReadInfo> reads;
    std::ifstream file ( filename );
    std::string line = "";
    if (!file.is_open())
        LOG_ERROR("Error opening file:%s",filename);

    while (std::getline(file, line))
    {
        std::stringstream strstr(line);
        std::string word = "";
        int col=0;
        int value=0;
        wevote::ReadInfo read;
        while (std::getline(strstr,word, ','))
        {
            if(col++==0)
                read.seqID=word;
            else
            {
                value=atoi(word.c_str());
                read.annotation.push_back(value);
            }
        }
        reads.push_back(read);
    }
    return reads;
}

void WevoteClassifier::writeResults(
        const std::vector<ReadInfo> &reads,
        const std::string &fileName)
{
    /// Export the detailed output in txt format
    std::ofstream myfile;
    myfile.open (fileName.c_str());
    if (!myfile.is_open())
        LOG_ERROR("Error opening Output file:%s",fileName);

    for ( const ReadInfo &read : reads )
        myfile << read.seqID << "\t"
               << read.numToolsUsed << "\t"
               << read.numToolsReported << "\t"
               << read.numToolsAgreed<<"\t"
               << read.score << "\t"
               << io::join(
                      io::asStringsVector( read.annotation.cbegin() ,
                                           read.annotation.cend()) , "\t") << "\t"
               << read.resolvedTaxon << "\n";

    myfile.close();
}

std::map<uint32_t, TaxLine>
WevoteClassifier::readResults(
        const std::string &filename,
        const TaxonomyBuilder &taxonomy )
{
    std::map< uint32_t , TaxLine > taxonAnnotateMap;

    std::ifstream file (filename);
    std::string line = "";

    if (!file.is_open())
        LOG_ERROR("Error opening file:%s",filename.c_str());

    int q=0;
    while (std::getline(file, line))
    {
        q++;
        std::stringstream strstr(line);
        std::string word = "";

        // column:0
        std::getline(strstr,word, ',');
        uint32_t taxon = atoi(word.c_str());
        if( taxon == ReadInfo::noAnnotation )
        {
            LOG_DEBUG("Taxon 0 presents in line = %d",q);
            taxon = taxonomy.correctTaxan( taxon );
        }
        // column:1
        std::getline(strstr,word, ',');
        uint32_t count = atoi(word.c_str());

        if ( taxonAnnotateMap.find(taxon) == taxonAnnotateMap.end() )
        {
            taxonAnnotateMap[taxon].count = count;
            taxonAnnotateMap[taxon].taxon = taxon;
        } else {
            taxonAnnotateMap[taxon].count += count;
        }
    }
    return taxonAnnotateMap;
}

void WevoteClassifier::_preprocessReads( std::vector<ReadInfo> &reads ) const
{
    uint32_t numToolsUsed= reads.front().annotation.size();
    uint32_t numReads= reads.size();

    LOG_INFO("Num of reads= %d" , numReads );
    LOG_INFO("Num of used tools= %d" , numToolsUsed );

    for( wevote::ReadInfo &read : reads )
        read.numToolsUsed = numToolsUsed;

    /// Correct TaxonID for the not standard ranks
    _taxonomy.correctTaxa( reads );

    /// Count number of tools that identified each sequences
    for( wevote::ReadInfo &read : reads )
        read.numToolsReported = std::count_if( read.annotation.cbegin() ,
                                               read.annotation.cend() ,
                                               []( uint32_t taxid ){
                return ReadInfo::isAnnotation( taxid ); });
}

}
