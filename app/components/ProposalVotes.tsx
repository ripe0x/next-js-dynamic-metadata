"use client";
import { ApolloClient, NormalizedCacheObject, DocumentNode, gql, ApolloError } from '@apollo/client';
import React, { useEffect } from 'react'
import subgraphClient from '../lib/subgraphClient';

type Props = {
  forVotes: string;
  againstVotes: number;
  abstainVotes: number;
}
const fetchSubgraphData = async (client: ApolloClient<NormalizedCacheObject>, query: DocumentNode) => {
  const { data } = await client.query({
    query: query
  });
  return data;
}

const ProposalVotes = ({ propId }: { propId: number }) => {
  const [proposalDetails, setProposalDetails] = React.useState<Props>();
  const client = subgraphClient();
  const query = gql`
    query getProposal {
      proposal(id: ${propId}) {
        forVotes
        againstVotes
        abstainVotes
      }
    }
    `;
  const getProposalDetails = async () => {
    const details = await fetchSubgraphData(client, query)
      .then((res) => {
        return res.proposal;
      })
      .catch((err) => {
        console.log(err);
      });
    return details;
  }

  useEffect(() => {
    getProposalDetails().then((data) => {
      if (!data) return
      console.log(proposalDetails);
      setProposalDetails(data);

    });

  }, [propId]);

  return (
    <div>
      {proposalDetails ? (
        <div>
          <p>For votes: {proposalDetails.forVotes}</p>
          <p>Against votes: {proposalDetails.againstVotes}</p>
          <p>Abstain votes: {proposalDetails.abstainVotes}</p>
        </div>
      ) : (
        <div>
          <p>Fetching latest votes...</p>
        </div>
      )}

    </div>
  )
}

export default ProposalVotes