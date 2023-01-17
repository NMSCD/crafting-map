export default function (x, y) {
  var nodes;
  var strength = () => 1;

  if (x == null) x = 0;
  if (y == null) y = 0;

  function force() {
    var i,
      n = nodes.length,
      node,
      sx = 0,
      sy = 0;

    for (i = 0; i < n; ++i) {
      (node = nodes[i]), (sx += node.x), (sy += node.y);
    }
    sx = sx / n - x;
    sy = sy / n - y;
    for (i = 0; i < n; ++i) {
      (node = nodes[i]), (node.x -= sx * strength(node)), (node.y -= sy * strength(node));
    }
  }

  force.initialize = function (_) {
    nodes = _;
  };

  force.x = function (_) {
    return arguments.length ? ((x = +_), force) : x;
  };

  force.y = function (_) {
    return arguments.length ? ((y = +_), force) : y;
  };

  force.strength = function (_) {
    return arguments.length ? (strength instanceof Function ? (strength = _) : (strength = () => +_), force) : strength;
  };

  return force;
}
