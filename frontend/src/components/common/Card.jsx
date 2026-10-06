export default function Card({ children, className = '', padded = true, as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={`bg-white rounded-lg border border-slate-200/80 shadow-card ${padded ? 'p-5' : ''} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
