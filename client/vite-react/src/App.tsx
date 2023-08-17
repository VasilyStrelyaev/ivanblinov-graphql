import React, { useState } from 'react';
import './App.css';
import {
  DataGrid, Column, Scrolling
} from 'devextreme-react/data-grid';

import CustomStore from 'devextreme/data/custom_store';
import { gql, useApolloClient } from '@apollo/client';
import { QueryResultItem, ReactionStats, UserStatsRow } from './types';

import _ from 'lodash';
import { ReactionType } from '../../../types';

type GetFavoriteReactionFn = (reactions: { ReactionType: ReactionType }[]) => ReactionType;

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

export default function App() {
  const appoloClient = useApolloClient();
  const [userStatsData] = useState(new CustomStore<UserStatsRow, string>({
    key: 'userId',
    load: () => appoloClient
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
        })))
  }));

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
    </React.Fragment>
  );
}
