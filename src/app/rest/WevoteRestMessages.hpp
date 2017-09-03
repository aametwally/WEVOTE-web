#ifndef WEVOTERESTMESSAGES_HPP
#define WEVOTERESTMESSAGES_HPP

#include "WevoteJSON.hpp"
#include "ReadInfo.h"
#include "Serializable.hpp"

class WevoteSubmitEnsemble : public Serializable< WevoteSubmitEnsemble >
{
protected:
    friend class Serializable< WevoteSubmitEnsemble >;
public:
    WevoteSubmitEnsemble()
        : _d( new Data ){}

    template< typename Objectifier >
    void objectify( Objectifier &properties ) const
    {
        auto meta = _meta< wchar_t , Meta >;
        properties.objectify( meta( Meta::JobID ) , _d->jobID );
        properties.objectify( meta( Meta::Reads ) , _d->reads.cbegin() , _d->reads.cend() );
        properties.objectify( meta( Meta::Score  ) , _d->score );
        properties.objectify( meta( Meta::Penalty  ) , _d->penalty );
        properties.objectify( meta( Meta::MinNumAgreed  ) , _d->minNumAgreed );
    }

private:
    enum class Meta
    {
        JobID ,
        Reads ,
        Score ,
        Penalty ,
        MinNumAgreed
    };

    struct Data
    {
        std::string jobID;
        std::vector< wevote::ReadInfo > reads;
        double score;
        double penalty;
        double minNumAgreed;
    };

    template< typename DeObjectifier >
    void _populateFromObject( const DeObjectifier &properties )
    {
        auto meta = _meta< defs::char_t , Meta >;
        properties.deObjectify( meta( Meta::JobID ) , _d->jobID );
        properties.deObjectifyArray( meta( Meta::Reads ) , _d->reads );
        properties.deObjectify( meta( Meta::Score  ) , _d->score );
        properties.deObjectify( meta( Meta::Penalty  ) , _d->penalty );
        properties.deObjectify( meta( Meta::MinNumAgreed  ) , _d->minNumAgreed );
    }

    static const std::map< Meta , std::string > &_metaMap()
    {
        static const std::map< Meta , std::string > m {
            { Meta::JobID , "jobID" } ,
            { Meta::Reads , "reads" } ,
            { Meta::Score , "score" } ,
            { Meta::Penalty , "penalty" } ,
            { Meta::MinNumAgreed , "minNumAgreed"}
        };
        return m;
    }

    std::shared_ptr< Data > _d;
};


#endif // WEVOTERESTMESSAGES_HPP
