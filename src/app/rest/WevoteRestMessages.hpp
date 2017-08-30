#ifndef WEVOTERESTMESSAGES_HPP
#define WEVOTERESTMESSAGES_HPP

#include "WevoteJSON.hpp"
#include "ReadInfo.h"

class WevoteSubmitEnsemble
{
    WevoteSubmitEnsemble()
        : _d( new Data ){}

    template< typename Objectifier >
    void objectify( Objectifier &properties ) const
    {
        properties.objectify( _meta( Meta::JobID ) , _d->jobID );
        properties.objectify( _meta( Meta::Reads ) , _d->reads.cbegin() , _d->reads.cend() );
        properties.objectify( _meta( Meta::Score  ) , _d->score );
        properties.objectify( _meta( Meta::Penalty  ) , _d->penalty );
        properties.objectify( _meta( Meta::MinNumAgreed  ) , _d->minNumAgreed );
    }

    template< typename DeObjectifier >
    static WevoteSubmitEnsemble fromObject( const DeObjectifier &properties )
    {
        WevoteSubmitEnsemble w;
        w._populateFromObject( properties );
        return w;
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
        properties.deObjectify( _meta( Meta::JobID ) , _d->jobID );
        properties.deObjectifyArray( _meta( Meta::Reads ) , _d->reads );
        properties.deObjectify( _meta( Meta::Score  ) , _d->score );
        properties.deObjectify( _meta( Meta::Penalty  ) , _d->penalty );
        properties.deObjectify( _meta( Meta::MinNumAgreed  ) , _d->minNumAgreed );
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

    static std::string _meta( Meta meta )
    {
        return _metaMap().at( meta );
    }

    std::shared_ptr< Data > _d;
};


#endif // WEVOTERESTMESSAGES_HPP
