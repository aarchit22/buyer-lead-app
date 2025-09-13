interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function EmptyState({ title, description, icon = "📋", action }: EmptyStateProps) {
  return (
    <div className="panel text-center space-y-4 p-12">
      <div className="text-6xl">{icon}</div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted max-w-md mx-auto">{description}</p>
      </div>
      {action && (
        action.href ? (
          <a href={action.href} className="btn btn-primary inline-block">
            {action.label}
          </a>
        ) : (
          <button onClick={action.onClick} className="btn btn-primary">
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
