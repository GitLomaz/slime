function transformMap(map) {
  map.validSpawnTiles = [];
  map.layers[0].data.forEach(function (row) {
    row.forEach(function (tile) {
      if (tile.index === 50) {
        let str = "";
        str += map.layers[0].data[tile.y - 1][tile.x].index === -1 ? "1" : "0";
        str += map.layers[0].data[tile.y][tile.x + 1].index === -1 ? "1" : "0";
        str += map.layers[0].data[tile.y + 1][tile.x].index === -1 ? "1" : "0";
        str += map.layers[0].data[tile.y][tile.x - 1].index === -1 ? "1" : "0";
        let digit = parseInt(str, 2);
        if (digit !== 0) {
          switch (digit) {
            case 9:
              tile.index = 25;
              break;
            case 12:
              tile.index = 27;
              break;
            case 8:
              tile.index = 26;
              break;
            case 4:
              tile.index = 51;
              break;
            case 1:
              tile.index = 49;
              break;
            case 3:
              tile.index = 73;
              break;
            case 6:
              tile.index = 75;
              break;
            case 2:
              tile.index = 74;
              break;
            default:
              break;
          }
        } else {
          map.validSpawnTiles.push({ x: tile.pixelX, y: tile.pixelY });
        }
      }
    });
  });
  map.layers[0].data.forEach(function (row) {
    row.forEach(function (tile) {
      if (tile.index === 50) {
        if (map.layers[0].data[tile.y - 1][tile.x - 1].index === -1) {
          tile.index = 52;
        } else if (map.layers[0].data[tile.y - 1][tile.x + 1].index === -1) {
          tile.index = 53;
        } else if (map.layers[0].data[tile.y + 1][tile.x - 1].index === -1) {
          tile.index = 76;
        } else if (map.layers[0].data[tile.y + 1][tile.x + 1].index === -1) {
          tile.index = 77;
        }
      }
    });
  });

  map.layers[0].data.forEach(function (row) {
    row.forEach(function (tile) {
      if (tile.index === 50) {
        if (oneIn(3)) {
          tile.index = getRandomInt(385, 408);
        }
        if (oneIn(20)) {
          map.layers[1].data[tile.y][tile.x].index = getRandomInt(7, 17);
        } else if (oneIn(100)) {
          map.layers[1].data[tile.y][tile.x].index = getRandomInt(31, 40);
        } else if (oneIn(100)) {
          let flower = getRandomInt(81, 88) + getRandomInt(0, 4) * 24;
          map.layers[1].data[tile.y][tile.x].index = flower;
        }
      }
    });
  });
  map.layers[0].data.forEach(function (row) {
    row.forEach(function (tile) {
      if (tile.index === -1) {
        tile.index = 0
      }
    });
  });
  return map;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function oneIn(value) {
  return getRandomInt(1, value + 1) === 1;
}

function getIndex(x, y, width) {
  return y * width + x;
}

function inBounds(x, y, width, height) {
  return x >= 0 && x < width && y >= 0 && y < height;
}

function spawnLevel() {
  LEVELS[0].enemies.forEach((e) => {
    for (let i = 0; i < e.amount; i++) {
      switch (e.type) {
        case "blob":
          new Blob();
          break;
      }
    }
  });
}

function worldToTile(map, x, y) {
  const t = map.worldToTileXY(x, y);
  return { x: t.x, y: t.y };
}

function tileCenterToWorld(map, tx, ty) {
  const p = map.tileToWorldXY(tx, ty);
  return {
    x: p.x + map.tileWidth / 2,
    y: p.y + map.tileHeight / 2,
  };
}

// returns { path, nextWorldPoint } (or null if no path)
function getPathAndNextWaypoint(fromX, fromY, toX, toY) {
  const map = scene.map;

  const start = worldToTile(map, fromX, fromY);
  const goal = worldToTile(map, toX, toY);

  // CLONE grid every time (PF mutates it!)
  const grid = scene.pfGrid.clone();
  const finder = scene.pfFinder;

  const sx = Phaser.Math.Clamp(start.x, 0, map.width - 1);
  const sy = Phaser.Math.Clamp(start.y, 0, map.height - 1);
  const gx = Phaser.Math.Clamp(goal.x, 0, map.width - 1);
  const gy = Phaser.Math.Clamp(goal.y, 0, map.height - 1);

  // If goal is blocked, fail for now (we'll improve this later)
  if (!grid.isWalkableAt(gx, gy)) return null;

  const path = finder.findPath(sx, sy, gx, gy, grid);
  if (!path || path.length < 2) return null;

  // path[0] is current tile, path[1] is the NEXT tile to step toward
  const [nx, ny] = path[1];
  const nextWorldPoint = tileCenterToWorld(map, nx, ny);

  return { path, nextWorldPoint };
}

function hasClearLineToTarget(fromX, fromY, toX, toY, radius = 32) {
  const map = scene.map;

  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.hypot(dx, dy);

  if (len === 0) return true;

  // perpendicular normal
  const nx = -dy / len;
  const ny = dx / len;

  // number of rays across thickness
  const steps = Math.ceil(radius / map.tileWidth);

  for (let i = -steps; i <= steps; i++) {

    const offsetX = nx * i * map.tileWidth * 0.5;
    const offsetY = ny * i * map.tileWidth * 0.5;

    if (!rayClear(
      fromX + offsetX,
      fromY + offsetY,
      toX + offsetX,
      toY + offsetY
    )) {
      return false;
    }
  }

  return true;
}

function rayClear(fromX, fromY, toX, toY) {
  const map = scene.map;
  const layerData = map.layers[0].data;

  const a = map.worldToTileXY(fromX, fromY);
  const b = map.worldToTileXY(toX, toY);

  const line = new Phaser.Geom.Line(a.x, a.y, b.x, b.y);
  const points = line.getPoints(
    Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y))
  );

  for (const p of points) {
    const tx = Math.round(p.x);
    const ty = Math.round(p.y);

    if (ty < 0 || ty >= layerData.length) continue;
    if (tx < 0 || tx >= layerData[0].length) continue;

    const tile = layerData[ty][tx];

    if (!tile || tile.index === 0) return false;
  }

  return true;
}