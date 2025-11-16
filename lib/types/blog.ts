import { Timestamp } from 'firebase/firestore';

export interface BlogItem {
  id: string;
  title: string;
  description: string;
  ogp_image: string;
  content: string;
  tag: string;
  content_url: string;
  markdown_url: string;
  update_date: Timestamp;
  created_date: Timestamp;
  publish: boolean;
  elements: unknown[];
}

export class Item implements BlogItem {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public ogp_image: string,
    public content: string,
    public tag: string,
    public content_url: string,
    public markdown_url: string,
    public update_date: Timestamp,
    public created_date: Timestamp,
    public publish: boolean,
    public elements: [],
  ) {}

  toString() {
    return JSON.stringify(this);
  }
}
