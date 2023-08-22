export type ContactStatsRow = {
  contactId: number;
  name: string;
  messageCountLastMonth: number;
  openTasks: number;
};

export type QueryResultItem = {
  id: number;
  name: string;
  messages: { text: string }[];
  tasks: { status: string }[];
};
