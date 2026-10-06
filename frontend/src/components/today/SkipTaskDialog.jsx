import Dialog from '../common/Dialog'

export default function SkipTaskDialog({ open, onClose, onConfirm, taskTitle }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      onConfirm={() => {
        onConfirm()
        onClose()
      }}
      title="Skip this task?"
      description={`Skipping "${taskTitle}" counts against your plan. If several tasks are skipped, PrepPilot may suggest adjusting or replanning.`}
      confirmLabel="Skip task"
      tone="danger"
    />
  )
}
