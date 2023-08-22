import React, { useState, useMemo } from 'react';
import './App.css';
import {
  DataGrid, Column, Scrolling
} from 'devextreme-react/data-grid';

import CustomStore from 'devextreme/data/custom_store';
import { ApolloClient, gql, useApolloClient } from '@apollo/client';
import { QueryResultItem, ContactStatsRow } from './types';

type PrepareDataSourceFn = (appoloClient: ApolloClient<object>) => Promise<ContactStatsRow[]>;

const ContactsQuery = gql`
query GetAllContacts($fromDate: String!, $toDate: String!) {
  Contacts {
    id,
    name,
    messages(from: $fromDate, to: $toDate) {
      text
    },
    tasks {
      status
    }
  }
}`;

const prepareDataSource: PrepareDataSourceFn = async (appoloClient) => {
  return appoloClient
    .query({
      query: ContactsQuery,
      variables: {
        fromDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        toDate: new Date().toISOString()
      } })
    .then(response => response.data.Contacts)
    .then((data: QueryResultItem[]) => data.map<ContactStatsRow>(dataItem => ({
      contactId: dataItem.id,
      name: dataItem.name,
      messageCountLastMonth: dataItem.messages?.length || 0,
      openTasks: dataItem.tasks.filter(task => task.status === 'Open').length
    })));
};

export default function App() {
  const appoloClient = useApolloClient();

  const [dataLoadDuration, setDataLoadDuration] = useState<number | undefined>(void 0);
  const [dataSourceLength, setDataSourceLength] = useState<number | undefined>(void 0);

  const contactStatsData = useMemo(() => new CustomStore<ContactStatsRow, string>({
    key: 'contactId',
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
        dataSource={contactStatsData}
        repaintChangesOnly={true}
      >
        <Scrolling
          mode="virtual"
        />

        <Column dataField="name" dataType="string">
        </Column>

        <Column dataField="messageCountLastMonth" dataType="number">
        </Column>

        <Column dataField="openTasks" dataType="number">
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
