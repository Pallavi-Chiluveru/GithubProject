const clients = new Map();

export function addNotificationClient(userId, res) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }

  clients.get(userId).add(res);
}

export function removeNotificationClient(userId, res) {
  clients.get(userId)?.delete(res);
}

export function notifyUsers(userIds, payload) {
  const sent = new Set();

  userIds.filter(Boolean).forEach((id) => {
    const userId = id.toString();
    if (sent.has(userId)) return;
    sent.add(userId);

    clients.get(userId)?.forEach((res) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    });
  });
}
