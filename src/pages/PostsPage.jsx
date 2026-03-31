import ContentManager from './ContentManager';

export default function PostsPage() {
  return (
    <ContentManager
      title="Posts"
      description="Feed posts — filter by author and date range."
      segment="posts"
      showSensitive
      showHide
    />
  );
}
