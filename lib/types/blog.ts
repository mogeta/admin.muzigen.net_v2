import { Timestamp } from 'firebase/firestore';

export interface BlogItem {
  id: string;
  title: string;
  description: string;
  publish: boolean;
  tags?: string[];
  ogp_image?: string;
  content_url?: string;
  markdown_url?: string;
  created_date: Timestamp;
  update_date: Timestamp;
  content?: string;
  elements?: unknown[];
}

export class Item implements BlogItem {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public publish: boolean,
    public created_date: Timestamp,
    public update_date: Timestamp,
    public tags?: string[],
    public ogp_image?: string,
    public content_url?: string,
    public markdown_url?: string,
    public content?: string,
    public elements?: unknown[],
  ) {}

  toString() {
    return JSON.stringify(this);
  }
}
