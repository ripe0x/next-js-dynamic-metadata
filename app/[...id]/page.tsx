import { ApolloClient, NormalizedCacheObject, ApolloError, gql, DocumentNode } from '@apollo/client';
import subgraphClient from '../lib/subgraphClient';
import Head from 'next/head';
import ProposalVotes from '../components/ProposalVotes';

type PropPreview = {
  id: string;
  title: string;
};

type Props = {
  params: PropPreview;
};

const fetchSubgraphData = async (client: ApolloClient<NormalizedCacheObject>, query: DocumentNode) => {
  const { data } = await client.query({
    query: query
  });
  return data;
}

const fetchAllPropPreviews = async () => {
  const client = subgraphClient();
  const query = gql`
    query getProposals {
      proposals {
        id
        title
      }
    }
  `;
  const data: PropPreview[] | ApolloError = await fetchSubgraphData(client, query)
    .then((res) => {
      return res.proposals;
    })
    .catch((err) => {
      console.log(err);
      return err as ApolloError;
    });
  return data;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = params;
  const client = subgraphClient();
  const query = gql`
    query getProposal {
      proposal(id: ${id}) {
        title
        description
      }
    }
    `;
  const data: { title: string, description: string } | ApolloError = await fetchSubgraphData(client, query)
    .then((res) => {
      return res.proposal;
    })
    .catch((err) => {
      console.log(err);
      return err as ApolloError;
    });

  if (!data || data instanceof ApolloError) return null

  return {
    title: `#${id} ${data.title}`,
    description: data.description
  }
}

export async function generateStaticParams() {
  // get minimum data needed to generate static paths and metadata for all props
  const allPages = await fetchAllPropPreviews().then((res) => {
    return res;
  }).catch((err) => {
    console.log(err);
    return err as ApolloError;
  });

  if (!allPages || allPages instanceof ApolloError) {
    return [];
  }

  const pages = allPages.map((page) => ({
    params: {
      id: page.id,
      title: page.title
    }
  }));

  return pages;
}

export default async function Page({ params }: Props) {
  // fetch the rest of the prop data on client side
  const client = subgraphClient();
  const query = gql`
    query getProposal {
      proposal(id: ${params.id}) {
        title
        description
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
    return details as { title: string, description: string };
  }

  const proposalDetails = await getProposalDetails();
  return (
    <>
      <Head>
        <title>#{params.id} {params.title}</title>
      </Head>
      <h1 className='text-2xl my-5'>#{params.id} {proposalDetails.title}</h1>
      <ProposalVotes propId={+params.id} />
      <hr className='opacity-50 my-3' />
      <p>{proposalDetails.description}</p>
    </>
  );
}