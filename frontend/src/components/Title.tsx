type PageTitleProps = {
  title: string;
};

export default function PageTitle({ title }: PageTitleProps) {
  return (
    <div className="flex items-center space-x-3 mb-6 bg-blue-50">
      <h1 className="py-2 border-l-5 border-blue-600 text-3xl font-semibold text-gray-900 pl-5">
        {title}
      </h1>
    </div>
  );
}
