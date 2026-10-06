import Badge from '../common/Badge'
import { DAY_STATUS_COLOR, DAY_STATUS_LABEL } from '../../utils/constants'

export default function PlanProgressBadge({ status }) {
  return <Badge className={DAY_STATUS_COLOR[status]}>{DAY_STATUS_LABEL[status]}</Badge>
}
