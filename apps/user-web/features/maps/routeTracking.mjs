// Local tangent-plane projection is accurate enough for detecting deviations of
// tens of meters. Check segments, not just vertices on sparse route geometries.
export function distanceToRoute(position, paths) {
  const scaleY = Math.PI * 6371000 / 180;
  const scaleX = scaleY * Math.cos(position[0] * Math.PI / 180);
  let nearest = Infinity;
  for (const path of paths) {
    for (let i = 1; i < path.length; i++) {
      const a = [(path[i - 1][1] - position[1]) * scaleX, (path[i - 1][0] - position[0]) * scaleY];
      const b = [(path[i][1] - position[1]) * scaleX, (path[i][0] - position[0]) * scaleY];
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const lengthSquared = dx * dx + dy * dy;
      const t = lengthSquared ? Math.max(0, Math.min(1, -(a[0] * dx + a[1] * dy) / lengthSquared)) : 0;
      nearest = Math.min(nearest, Math.hypot(a[0] + t * dx, a[1] + t * dy));
    }
  }
  return nearest;
}

export function shouldReroute({ position, accuracy, timestamp, paths, now, lastRequest, offRouteSince, mode }) {
  if (!timestamp || now - timestamp > 15000 || !Number.isFinite(accuracy) || accuracy > 50) return false;
  const threshold = Math.max(mode === "walk" ? 35 : 60, accuracy * 2);
  return distanceToRoute(position, paths) > threshold && offRouteSince != null
    && now - offRouteSince >= 8000 && now - lastRequest >= 30000;
}
