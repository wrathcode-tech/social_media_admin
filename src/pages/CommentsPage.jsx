import ContentManager from './ContentManager';

export default function CommentsPage() {
  return (
    <ContentManager
      title="Comments"
      description="Comments on posts — delete spam or abuse."
      segment="comments"
      showHide={false}
    />
  );
}
