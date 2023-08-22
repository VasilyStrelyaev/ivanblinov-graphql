export type ContactLink = { contactId: number };

export type Contact = {
  id: number;
  name: string;
  position: string;
  status: string;
  company: string;
  phone: string;
  email: string;
  assignedTo: string;
};

export type TaskUITG = {
  text: string;
  date: string;
  status: string;
  priority: string;
  manager: string;
};

export type Task = TaskUITG & ContactLink;

export type MessageUITG = {
  text: string;
  subject: string;
  date: string;
  manager: string;
};

export type Message = MessageUITG & ContactLink;
