export type ReactionType = 'smile' | 'heart' | 'fire' | 'crying';

export type User = {
  ID: string;
  PublicName: string;
  Bio: string;
  PublicLocation: string;
  AvatarURL: string;
}

export type Post = {
  ID: string;
  AuthorID: string;
  PostedAt: string;
  Content: string;
}

export type Reaction = {
  ID: string;
  AuthorID: string;
  PostID: string;
  LeftAt: string;
  ReactionType: ReactionType;
}