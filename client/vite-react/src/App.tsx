import React, { useState, useMemo } from 'react';
import './App.css';
import {
  DataGrid, Column, Scrolling
} from 'devextreme-react/data-grid';

import CustomStore from 'devextreme/data/custom_store';
import { ApolloClient, gql, useApolloClient } from '@apollo/client';
import { QueryResultItem, ReactionStats, UserStatsRow } from './types';

import { ReactionType } from '../../../types';

type GetFavoriteReactionFn = (reactions: { ReactionType: ReactionType }[]) => ReactionType;
type PrepareDataSourceFn = (appoloClient: ApolloClient<object>) => Promise<UserStatsRow[]>;

const UsersQuery = gql`
query GetAllUsers($fromDate: String!, $toDate: String!) {
  Users {
    ID,
    PublicName,
    Posts(from: $fromDate, to: $toDate) {
      ID
    },
    Reactions {
      ReactionType
    }
  }
}`;

const getFavoriteReaction: GetFavoriteReactionFn = (reactions) => {
  const reactionStats = reactions.reduce<ReactionStats>((acc, reaction) => {
    acc[reaction.ReactionType]++;

    return acc;
  }, { smile: 0, heart: 0, fire: 0, crying: 0 });

  const sortedReactionStats = Object.entries(reactionStats).sort((stat1, stat2) => stat1[1] - stat2[1]);

  return sortedReactionStats[sortedReactionStats.length - 1][0] as ReactionType;
};

const prepareDataSource: PrepareDataSourceFn = async (appoloClient) => {
  return appoloClient
    .query({
      query: UsersQuery,
      variables: {
        fromDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        toDate: new Date().toISOString()
      } })
    .then(response => response.data.Users)
    .then((data: QueryResultItem[]) => data.map<UserStatsRow>(dataItem => ({
      userId: dataItem.ID,
      publicName: dataItem.PublicName,
      postCountLastMonth: dataItem.Posts.length,
      favoriteReaction: getFavoriteReaction(dataItem.Reactions)
    })));
};

export default function App() {
  const appoloClient = useApolloClient();

  const [dataLoadDuration, setDataLoadDuration] = useState<number | undefined>(void 0);
  const [dataSourceLength, setDataSourceLength] = useState<number | undefined>(void 0);

  const userStatsData = useMemo(() => new CustomStore<UserStatsRow, string>({
    key: 'userId',
    load: async () => {
      const dataLoadStarted = Date.now();

      const dataSource = await prepareDataSource(appoloClient);

      setDataLoadDuration(Date.now() - dataLoadStarted);
      setDataSourceLength(dataSource.length);

      return dataSource;
    }
  }), [appoloClient, setDataLoadDuration, setDataSourceLength]);

  return (
    <React.Fragment>
      <DataGrid
        id="grid"
        showBorders={true}
        dataSource={userStatsData}
        repaintChangesOnly={true}
      >
        <Scrolling
          mode="virtual"
        />

        <Column dataField="publicName" dataType="string">
        </Column>

        <Column dataField="postCountLastMonth" dataType="number">
        </Column>

        <Column dataField="favoriteReaction" dataType="string">
        </Column>
      </DataGrid>
      { dataLoadDuration &&
        <div>
          <h2>GraphQL</h2>
          <div>{`${dataSourceLength} rows loaded in ${dataLoadDuration} milliseconds`}</div>
        </div>
      }
    </React.Fragment>
  );
}
