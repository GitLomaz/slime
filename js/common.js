function transformMap(map) {
  map.validSpawnTiles = [];
  map.layers[0].data.forEach(function (row) {
    row.forEach(function (tile) {
      if (tile.index === 50) {
        map.validSpawnTiles.push({ x: tile.pixelX, y: tile.pixelY });
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