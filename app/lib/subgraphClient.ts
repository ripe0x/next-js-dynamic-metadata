import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { PUBLIC_SUBGRAPH_URL } from './constants';

const subgraphClient = () => {
  const APIURL = PUBLIC_SUBGRAPH_URL;
  const link = createHttpLink({
    uri: APIURL
  });

  return new ApolloClient({
    link,
    cache: new InMemoryCache()
  });
};

export default subgraphClient;
