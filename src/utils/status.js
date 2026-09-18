export const STATUSES = [
  { id: 'unread-unprinted', label: 'Unread, Unprinted' },
  { id: 'printed-ready', label: 'Printed & Ready' },
  { id: 'read', label: 'Read' },
];

export function statusLabel(id) {
  return STATUSES.find((status) => status.id === id)?.label || id;
}
